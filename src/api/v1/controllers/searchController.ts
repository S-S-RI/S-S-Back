import { Request, Response } from 'express';
// import * as wordnet from 'wordnet';
import findCollocation from '../utils/collocation';
const stopWords = [
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
  'this',
];

const collocations = [
  'strong coffee',
  'heavy rain',
  'fast food',
  'hard work',
  'high price',

  'academic achievement',
  'cognitive ability',
  'critical analysis',
  'cultural diversity',
  'economic growth',
  'global warming',
  'human rights',
  'social justice',
  'sustainable development',
  'technological advancement',

  'artificial intelligence',
  'artificial intelligence in medecine',
  'artificial human hand',
  'machine learning',
  'data science',
  'deep learning',
  'natural language processing',
  'computer vision',
  'cybersecurity',
  'cloud computing',
  'internet of things',
  'big data',
];
const searchController = {
  async searchDocuments(req: Request, res: Response) {
    const { phrase } = req.body;

    let words = phrase
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ');

    let usedIndices = new Set<number>();
    let processedWords: string[] = [];

    for (let i = 0; i < words.length; i++) {
      if (usedIndices.has(i)) continue;

      const word = words[i];
      const result = findCollocation(
        word,
        words,
        collocations.sort((a, b) => b.length - a.length)
      );

      if (result && result.includes(' ')) {
        processedWords.push(result);
        const collocationLength = result.split(' ').length;
        for (let j = 0; j < collocationLength; j++) {
          usedIndices.add(i + j);
        }
      } else if (!stopWords.includes(word)) {
        processedWords.push(word);
      }
    }

    processedWords = [...new Set(processedWords)];

    // await wordnet.init();

    // const themes = [];
    // for (const word of processedWords) {
    //   const synsets = await wordnet.lookup(word);

    //   for (const synset of synsets) {
    //     themes.push(synset.glossary);
    //   }
    // }

    res.status(200).json({ processedWords });
  },
};

export default searchController;
