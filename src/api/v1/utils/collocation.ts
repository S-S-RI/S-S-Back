function findCollocation(
  word: string,
  phrase: string[],
  collocations: string[]
): string | null {
  const index = phrase.indexOf(word);

  for (let collocation of collocations) {
    const collocationWords = collocation.split(' ');

    if (
      collocationWords.length > 1 &&
      collocationWords[0] === word &&
      collocationWords.every(
        (collWord, offset) => phrase[index + offset] === collWord
      )
    ) {
      return collocation;
    }
  }

  return word;
}

export async function findCollocationsOfPhrase(
  phrase: string[],
  collocationsList: string[],
  stopWordsList: string[]
) {
  let usedIndices = new Set<number>();
  let processedWords: string[] = [];

  // Step 3: Identify collocations
  for (let i = 0; i < phrase.length; i++) {
    if (usedIndices.has(i)) continue;

    const word = phrase[i];
    const result = findCollocation(
      word,
      phrase,
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
  return processedWords;
}

export default findCollocation;
