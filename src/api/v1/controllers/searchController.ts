import { Request, Response } from 'express';
import { findCollocationsOfPhrase } from '../utils/collocation';
import { Document } from '../models/documentSchema';
import { getDomainsForWord } from '../utils/wordnetHelper';
import getCollocationsandStopWords from '../utils/getCollocationsandStopWords';
import { normaliserEtLemmatiser } from '../utils/normaliser';
import calculateProduitScalaire from '../utils/produitScalaire';
import getThemesOfPhrase from '../utils/getThemesOfPhrase';

const searchController = {
  async searchDocuments(req: Request, res: Response) {
    try {
      const { phrase } = req.body;

      // Step 1: Fetch dynamic stop words and collocations from the database
      const [collocationsList, stopWordsList] =
        await getCollocationsandStopWords();

      // Step 2: Preprocess the phrase
      let words = await normaliserEtLemmatiser(phrase);
      console.log(words);

      // Step 3: Identify collocations
      let processedWords = await findCollocationsOfPhrase(
        words,
        collocationsList,
        stopWordsList
      );

      // Step 4: Use WordNet to identify related concepts
      const themes = await getThemesOfPhrase(processedWords);
      // Step 5: Fetch documents dynamically from the database
      const documents = await Document.find({
        $or: [
          { content: { $regex: processedWords.join('|'), $options: 'i' } },
          { themes: { $in: themes } },
        ],
      }).select('content themes');

      // Step 6: Calculate  produit scalaire and Rank documents
      const rankedDocuments = [];
      for (let doc of documents) {
        const ProduitScalaire = await calculateProduitScalaire(
          processedWords,
          doc._id.toString()
        );
        if (ProduitScalaire != 0) {
          rankedDocuments.push({ document: doc, ProduitScalaire });
        }
      }

      rankedDocuments.sort((a, b) => b.ProduitScalaire - a.ProduitScalaire);

      res.status(200).json({
        processedWords,
        themes,
        rankedDocuments: rankedDocuments.slice(0, 5),
      });
    } catch (error) {
      console.error('Error in searchDocuments:', error);
      res
        .status(500)
        .json({ error: 'An error occurred while processing the text.' });
    }
  },
};

export default searchController;
