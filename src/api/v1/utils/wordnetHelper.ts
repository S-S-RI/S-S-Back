import { WordNet } from 'natural';

const wordnet = new WordNet();

export const lookupWord = async (word: string) => {
  return new Promise((resolve, reject) => {
    wordnet.lookup(word, (results) => {
      if (results) resolve(results);
      else reject(new Error('No results found'));
    });
  });
};
