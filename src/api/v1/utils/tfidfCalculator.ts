type Document = string[];
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') 
    .split(/\s+/); 
}

export function computeTF(doc: Document, term: string): number {
  const termCount = doc.filter((word) => word === term).length;
  return termCount / doc.length; 
}
export function computeIDF(docs: Document[], term: string): number {
  const numDocsWithTerm = docs.filter((doc) => doc.includes(term)).length;
  // IDF formula: log(Number of docs / (1 + number of docs containing the term))
  return Math.log(docs.length / (1 + numDocsWithTerm));
}

// Compute the TF-IDF score for each term in the processedWords array
export function computeTFIDF(
  docs: Document[],
  processedWords: string[]
): Record<string, number> {
  const tfidfScores: Record<string, number> = {};

  const normalizedDocs = docs.map((doc) => normalizeText(doc.join(' ')));  

  processedWords.forEach((term) => {
    let tfidfScore = 0;

    
    normalizedDocs.forEach((doc) => {
      const tf = computeTF(doc, term);
      const idf = computeIDF(normalizedDocs, term);
      tfidfScore += tf * idf; 
    });

    
    tfidfScores[term] = tfidfScore;
    console.log(`Final TF-IDF for '${term}': ${tfidfScore}`); 
  });

  return tfidfScores;
}
