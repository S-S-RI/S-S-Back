import fs from 'fs';
import path from 'path';
import natural from 'natural';
import { Document } from '../models/documentSchema';
import findCollocation from './collocation';
import getCollocationsandStopWords from './getCollocationsandStopWords';
const WordNet = natural.WordNet;
const wordnet20data = path.join(__dirname, '../../../../WordNet-2.0/dict/');
const wordnet = new WordNet(wordnet20data);

const domainsFilePath = path.join(
  __dirname,
  '../../../../wn-domains-3.2-20070223'
);

const parseDomainsFile = (): Record<string, string[]> => {
  const domainMap: Record<string, string[]> = {};
  const data = fs.readFileSync(domainsFilePath, 'utf-8');

  data.split('\n').forEach((line) => {
    const [synsetId, domains] = line.split('\t');
    if (synsetId && domains) {
      domainMap[synsetId] = domains.split(' ');
    }
  });

  return domainMap;
};

const domainMap = parseDomainsFile();
export const getDomainsForWord = (word: string): Promise<string[]> => {
  return new Promise((resolve) => {
    wordnet.lookup(word, (results) => {
      if (results.length === 0) {
        resolve(['Unknown']);
        return;
      }
      const domains = results.flatMap((result) => {
        const synsetId = `${result.synsetOffset.toString().padStart(8, '0')}-${
          result.pos
        }`;

        return domainMap[synsetId] || [];
      });

      resolve([...new Set(domains)]);
    });
  });
};

export const generateDomainFile = async () => {
  try {
    const documents = await Document.find();

    const domainResults: Record<string, string[]> = {};
    const [collocationsList, stopWordsList] =
      await getCollocationsandStopWords();
    for (const doc of documents) {
      console.log(`Processing document ID: ${doc._id}`);

      const phrase = doc.content;
      let words = phrase
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(' ');

      const processedWords = new Array<string>();

      let usedIndices = new Set<number>();

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

      const themeFrequencies: Record<string, number> = {};

      for (const word of processedWords) {
        const themes = await getDomainsForWord(word);
        for (const theme of themes) {
          if (theme !== 'factotum' && theme !== 'Unknown') {
            themeFrequencies[theme] = (themeFrequencies[theme] || 0) + 1;
          }
        }
      }

      const sortedThemes = Object.entries(themeFrequencies)
        .sort((a, b) => b[1] - a[1])
        .map(([theme]) => theme)
        .slice(0, 3);

      domainResults[doc._id.toString()] = sortedThemes;
    }

    const domainFileContent = Object.entries(domainResults)
      .map(([docId, themes]) => `${docId}\t${themes.join(' ')}`)
      .join('\n');

    fs.writeFileSync('document-domains.txt', domainFileContent, 'utf-8');
    console.log('Fichier des domaines généré avec succès !');
  } catch (error) {
    console.error('Erreur lors de la génération du fichier :', error);
  }
};

export { domainMap };
