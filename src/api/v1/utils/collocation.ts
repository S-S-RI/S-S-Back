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

export default findCollocation;
