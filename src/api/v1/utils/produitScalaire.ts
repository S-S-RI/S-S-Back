import { Document } from '../models/documentSchema';
import { InvertedIndex } from '../models/invertedIndexSchema';
export default async function calculateProduitScalaire(
  query: string[],
  documentId: string
): Promise<number> {
  let ProduitScalaire = 0;
  for (let word of query) {
    const queryTF = query.filter((w) => w === word).length / query.length;
    const termData = await getTermDataFromInvertedIndex(word);
    const document = await Document.findById(documentId);
    if (!document) {
      console.error(`Document not found for ID: ${documentId}`);
      continue;
    }
    const documentName = document.name;
    console.log('Document name:', documentName);

    const docPosting = termData.find(
      (posting) => posting.documentName === documentName
    );

    if (!docPosting) {
      console.log(
        `Word: ${word}, no posting found for document: ${documentId}`
      );
      continue;
    }

    console.log(`Word: ${word}, Document TF-IDF: ${docPosting.tfidf}`);

    ProduitScalaire += queryTF * docPosting.tfidf;
  }

  console.log(`Dot product for document (${documentId}): ${ProduitScalaire}`);
  return ProduitScalaire;
}

async function getTermDataFromInvertedIndex(term: string) {
  console.log(`Fetching term data for word: ${term}`);
  const termData = await InvertedIndex.findOne({ term: term });
  if (!termData) {
    console.log(`No data found for term: ${term}`);
  } else {
    console.log(`Term data found for term: ${term}`, termData.postings);
  }
  return termData ? termData.postings : [];
}
