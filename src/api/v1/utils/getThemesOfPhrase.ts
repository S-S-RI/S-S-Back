import nlp from 'compromise';
import { getDomainsForWord } from './wordnetHelper';
import axios from 'axios';
import { normaliserEtLemmatiser } from './normaliser';

interface GoogleKnowledgeGraphResponse {
  itemListElement: {
    result?: {
      description?: string;
    };
  }[];
}

async function fetchEntityTheme(entity: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY;
  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${entity}&key=${key}&limit=1&indent=True`;

  try {
    const response = await axios.get<GoogleKnowledgeGraphResponse>(url);
    const data = response.data;

    return data.itemListElement[0]?.result?.description || 'general';
  } catch (error) {
    console.error('Error fetching entity theme:', error);
    return 'general';
  }
}

function classifyEntity(word: string) {
  const doc = nlp(word);

  if (doc.organizations().found) {
    return 'company';
  }

  if (doc.people().found) {
    return 'celebrity';
  }

  return 'general';
}

export default async function getThemesOfPhrase(wordsList: string[]) {
  const themeFrequencies: Record<string, number> = {};

  for (const word of wordsList) {
    const entityType = classifyEntity(word.toUpperCase());

    if (entityType === 'company') {
      console.log(word + 'is a company');
      const companyThemes = await fetchEntityTheme(word);
      const separatedThemes = await normaliserEtLemmatiser(companyThemes);
      separatedThemes.forEach((theme) => {
        themeFrequencies[theme] = (themeFrequencies[theme] || 0) + 1;
      });
    } else if (entityType === 'celebrity') {
      const celebrityThemes = await fetchEntityTheme(word);
      const separatedThemes = await normaliserEtLemmatiser(celebrityThemes);
      separatedThemes.forEach((theme) => {
        themeFrequencies[theme] = (themeFrequencies[theme] || 0) + 1;
      });
    } else {
      const themes = await getDomainsForWord(word);
      for (const theme of themes) {
        if (theme !== 'factotum' && theme !== 'Unknown') {
          themeFrequencies[theme] = (themeFrequencies[theme] || 0) + 1;
        }
      }
    }
  }

  return Object.entries(themeFrequencies)
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
    .slice(0, 3);
}
