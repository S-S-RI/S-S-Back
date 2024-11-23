import { Request, Response } from 'express';
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
const searchController = {
  async searchDocuments(req: Request, res: Response) {
    const { phrase } = req.body;
    let words = phrase
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((word: string) => !stopWords.includes(word))
      .map((word: string) =>
        word
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      );
    res.status(200).json(words);
  },
};

export default searchController;
