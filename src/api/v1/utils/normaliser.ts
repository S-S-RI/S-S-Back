import lemmatizer from 'lemmatizer';

export async function normaliserEtLemmatiser(phrase: string) {
  let normalized = phrase
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let lemmatizedWords = normalized
    .split(' ')
    .map((word) => lemmatizer(word))
    .filter(Boolean);
  return lemmatizedWords;
}
