import redis from '../../database/redis';
import { Collocation } from '../models/collocationSchema';
import { StopList } from '../models/stoplistSchema';
import { setCache } from './cache';

export default async function getCollocationsandStopWords() {
  let stopWordsList: string[] = [];
  const cachedstopWords = await redis.get('stopwords:all');
  if (!cachedstopWords) {
    const stopWords = await StopList.find().select('content');
    const stopWordsListLowerCase = stopWords.map((stopWord) =>
      stopWord.content.toLowerCase()
    );
    setCache('stopwords:all', stopWordsListLowerCase);
    stopWordsList = stopWordsListLowerCase;
  } else {
    stopWordsList = JSON.parse(cachedstopWords);
  }

  let collocationsList: string[] = [];
  const cachedcollocations = await redis.get('cachedcollocations:all');
  if (!cachedcollocations) {
    const collocations = await Collocation.find().select('content');
    const collocationsListLowerCase = collocations.map((collocation) =>
      collocation.content.toLowerCase()
    );
    setCache('cachedcollocations:all', collocationsListLowerCase);
    collocationsList = collocationsListLowerCase;
  } else {
    collocationsList = JSON.parse(cachedcollocations);
  }

  return [collocationsList, stopWordsList];
}
