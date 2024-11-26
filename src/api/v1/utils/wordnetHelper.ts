import fs from 'fs';
import path from 'path';
import natural from 'natural';

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
      console.log(results);
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

export { domainMap };
