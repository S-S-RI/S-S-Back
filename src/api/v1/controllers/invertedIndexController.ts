import { InvertedIndex } from '../models/invertedIndexSchema';
import { Document } from '../models/documentSchema';
import { normaliserEtLemmatiser } from '../utils/normaliser';
import getCollocationsandStopWords from '../utils/getCollocationsandStopWords';

function computeTF(doc: string[], term: string): number {
  const termCount = doc.filter((word) => word === term).length;
  const termFrequencies = doc.reduce((freqs, word) => {
    freqs[word] = (freqs[word] || 0) + 1;
    return freqs;
  }, {} as Record<string, number>);
  const maxFreq = Math.max(...Object.values(termFrequencies));
  return maxFreq > 0 ? termCount / maxFreq : 0;
}

function computeIDF(docs: string[][], term: string): number {
  const numDocsWithTerm = docs.filter((doc) => doc.includes(term)).length;
  return Math.log10(docs.length / numDocsWithTerm);
}

async function buildInvertedIndex(): Promise<void> {
  try {
    console.log('Starting to build the inverted index with TF-IDF...');

    const exampleDocuments = await Document.find();
    const [collocationsList, stopWordsList] =
      await getCollocationsandStopWords();

    const invertedIndex: {
      [term: string]: {
        documentFrequency: number;
        postings: { documentName: string; tf: number; tfidf: number }[];
      };
    } = {};

    for (const [index, doc] of exampleDocuments.entries()) {
      const { content } = doc;
      const name = `doc${index + 1}`;
      console.log('Before lemmatization:', content);

      const words = await normaliserEtLemmatiser(content);
      console.log('After lemmatization:', words);

      const processedWords: string[] = [];
      const usedIndices = new Set<number>();

      for (let i = 0; i < words.length; i++) {
        if (usedIndices.has(i)) continue;

        const word = words[i];

        if (!isNaN(Number(word))) continue;

        const possibleCollocation = collocationsList.find(
          (collocation) =>
            collocation.startsWith(word) &&
            words.slice(i, i + collocation.split(' ').length).join(' ') ===
              collocation
        );

        if (possibleCollocation) {
          processedWords.push(possibleCollocation);
          const collocationLength = possibleCollocation.split(' ').length;
          for (let j = 0; j < collocationLength; j++) {
            usedIndices.add(i + j);
          }
        } else if (!stopWordsList.includes(word)) {
          processedWords.push(String(word));
        }
      }

      console.log(
        `Processed ${processedWords.length} words for document ${name}.`
      );

      const termFrequencies: { [word: string]: number } = {};
      processedWords.forEach((word) => {
        termFrequencies[word] = computeTF(processedWords, word);
      });

      Object.entries(termFrequencies).forEach(([term, tf]) => {
        if (!invertedIndex[term]) {
          invertedIndex[term] = { documentFrequency: 0, postings: [] };
        }
        const termEntry = invertedIndex[term];
        termEntry.documentFrequency += 1;
        termEntry.postings.push({ documentName: name, tf, tfidf: 0 });
      });
    }

    console.log(
      'Finished processing all documents. Computing IDF values and TF-IDF scores...'
    );

    Object.entries(invertedIndex).forEach(async ([term, data]) => {
      const idf = computeIDF(
        await Promise.all(
          exampleDocuments.map((doc) => normaliserEtLemmatiser(doc.content))
        ),
        term
      );

      data.postings.forEach((posting) => {
        posting.tfidf = parseFloat((posting.tf * idf).toFixed(4));
      });
    });

    console.log('Preparing bulk operations for the inverted index...');
    const bulkOps = Object.entries(invertedIndex).map(([term, data]) => ({
      updateOne: {
        filter: { term },
        update: {
          $set: {
            documentFrequency: data.documentFrequency,
            postings: data.postings,
          },
        },
        upsert: true,
      },
    }));

    console.log(`Executing ${bulkOps.length} bulk operations...`);
    if (bulkOps.length > 0) {
      await InvertedIndex.bulkWrite(bulkOps);
      console.log('Inverted index saved successfully!');
    } else {
      console.log('No bulk operations to execute. Inverted index is empty.');
    }
  } catch (error) {
    console.error('Error building inverted index:', error);
  }
}

export default buildInvertedIndex;

async function getTermsFromDB() {
  try {
    const terms = await InvertedIndex.find().select(
      'term documentFrequency postings'
    );
    console.log('Retrieved terms from database:', terms);

    const formattedTerms = terms.map((term) => ({
      term: term.term,
      documentFrequency: term.documentFrequency,
      postings: term.postings,
    }));

    return formattedTerms;
  } catch (error) {
    console.error('Error retrieving terms from database:', error);
    throw error;
  }
}

export { getTermsFromDB };
