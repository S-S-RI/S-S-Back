import { Request, Response } from 'express';
import { findCollocationsOfPhrase } from '../utils/collocation';
import { Document } from '../models/documentSchema';
import { getDomainsForWord } from '../utils/wordnetHelper';
import getCollocationsandStopWords from '../utils/getCollocationsandStopWords';
import { normaliserEtLemmatiser } from '../utils/normaliser';
import calculateProduitScalaire from '../utils/produitScalaire';
import getThemesOfPhrase from '../utils/getThemePrincipal';

const searchController = {
  async searchDocuments(req: Request, res: Response) {
    try {
      const { phrase } = req.body;

      // Step 1: Fetch dynamic stop words and collocations from the database
      const [collocationsList, stopWordsList] =
        await getCollocationsandStopWords();

      // Step 2: Preprocess the phrase
      let words = await normaliserEtLemmatiser(phrase);
      const etape1 = `phrase = ${words}`;
      // Step 3: Identify collocations
      let processedWords = await findCollocationsOfPhrase(
        words,
        collocationsList,
        stopWordsList
      );
      const etape2 = `phrase = ${processedWords}`;

      // Step 4: Use WordNet to identify related concepts
      const { themePrincipal, motsConcordants } = await getThemesOfPhrase(
        processedWords
      );
      // Step 5: Fetch documents dynamically from the database
      const documents = await Document.find({
        $or: [
          { content: { $regex: motsConcordants.join('|'), $options: 'i' } },
          { themes: { $in: [themePrincipal, ...motsConcordants] } },
        ],
      });

      // Step 6: Calculate  produit scalaire and Rank documents
      const rankedDocuments = [];
      const zeroProduitDocuments = [];

      for (let doc of documents) {
        const ProduitScalaire = await calculateProduitScalaire(
          motsConcordants,
          doc._id.toString()
        );
        if (ProduitScalaire !== 0) {
          rankedDocuments.push({ document: doc, ProduitScalaire });
        } else {
          zeroProduitDocuments.push({ document: doc, ProduitScalaire });
        }
      }

      const sortedZeroProduitDocuments = zeroProduitDocuments.sort((a, b) => {
        const indexA = a.document.themes.indexOf(themePrincipal);
        const indexB = b.document.themes.indexOf(themePrincipal);

        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      rankedDocuments.sort((a, b) => b.ProduitScalaire - a.ProduitScalaire);

      const finalRankedDocuments = [
        ...rankedDocuments,
        ...sortedZeroProduitDocuments,
      ];
      const steps = [etape1, etape2];
      res.status(200).json({
        steps,
        processedWords,
        themePrincipal,
        rankedDocuments: finalRankedDocuments,
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
