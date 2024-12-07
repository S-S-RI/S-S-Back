import { Request, Response } from 'express';
import { WordNet } from 'natural';
import findCollocation from '../utils/collocation';
import { computeTFIDF } from '../utils/tfidfCalculator';
import { Document } from '../models/documentSchema';
import { StopList } from '../models/stoplistSchema';
import { Collocation } from '../models/collocationSchema';
import { getDomainsForWord } from '../utils/wordnetHelper';
import redis from '../../database/redis';
import { invalidateCache, setCache } from '../utils/cache';
const wordNet = new WordNet();

const searchController = {
  async searchDocuments(req: Request, res: Response) {
    try {
      const { phrase } = req.body;

      // Step 1: Fetch dynamic stop words and collocations from the database
      let stopWordsList: string[] = [];
      const cachedstopWords = await redis.get('stopwords:all');
      if (!cachedstopWords) {
        const stopWords = await StopList.find().select('content');
        const stopWordsListLowerCase = stopWords.map((stopWord) =>
          stopWord.content.toLowerCase()
        );
        setCache('stopwords:all', stopWordsListLowerCase);
        stopWordsList = stopWordsListLowerCase;
      } else {
        stopWordsList = JSON.parse(cachedstopWords);
      }

      let collocationsList: string[] = [];
      const cachedcollocations = await redis.get('cachedcollocations:all');
      if (!cachedcollocations) {
        const collocations = await Collocation.find().select('content');
        const collocationsListLowerCase = collocations.map((collocation) =>
          collocation.content.toLowerCase()
        );
        setCache('cachedcollocations:all', collocationsListLowerCase);
        collocationsList = collocationsListLowerCase;
      } else {
        collocationsList = JSON.parse(cachedcollocations);
      }

      // Step 2: Preprocess the phrase
      let words = phrase
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(' ');

      let usedIndices = new Set<number>();
      let processedWords: string[] = [];

      // Step 3: Identify collocations
      for (let i = 0; i < words.length; i++) {
        if (usedIndices.has(i)) continue;

        const word = words[i];
        const result = findCollocation(
          word,
          words,
          collocationsList.sort((a, b) => b.length - a.length)
        );

        if (result && result.includes(' ')) {
          processedWords.push(result);
          const collocationLength = result.split(' ').length;
          for (let j = 0; j < collocationLength; j++) {
            usedIndices.add(i + j);
          }
        } else if (!stopWordsList.includes(word)) {
          processedWords.push(word);
        }
      }

      processedWords = [...new Set(processedWords)];
      console.log('Processed Words:', processedWords);

      // Step 4: Use WordNet to identify related concepts
      const themes = [];
      for (const word of processedWords) {
        const synsets = await getDomainsForWord(word);
        const filteredSynsets = synsets.filter((domain) => {
          return !domain.includes('factotum');
        });
        themes.push(filteredSynsets);
      }

      // Step 5: Fetch documents dynamically from the database
      const documents = await Document.find().select('content');

      // Convert the documents to the required format (array of string arrays)
      const docs = documents.map((doc: any) => doc.content.split(' '));

      // Step 6: Compute TF-IDF scores
      const tfidfScores = computeTFIDF(docs, processedWords);
      console.log('TF-IDF Scores:', tfidfScores);

      res.status(200).json({ processedWords, themes, tfidfScores });
    } catch (error) {
      console.error('Error in searchDocuments:', error);
      res
        .status(500)
        .json({ error: 'An error occurred while processing the text.' });
    }
  },
};

export default searchController;