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

export default async function getThemePrincipal(wordsList: string[]) {
  const themeFrequencies: Record<string, { count: number; words: string[] }> =
    {};

  for (const word of wordsList) {
    const entityType = classifyEntity(word.toUpperCase());

    let themes: string[] = [];
    if (entityType === 'company') {
      console.log(word + ' is a company');
      const companyThemes = await fetchEntityTheme(word);
      themes = await normaliserEtLemmatiser(companyThemes);
    } else if (entityType === 'celebrity') {
      const celebrityThemes = await fetchEntityTheme(word);
      themes = await normaliserEtLemmatiser(celebrityThemes);
    } else {
      themes = await getDomainsForWord(word);
      themes = themes.filter(
        (theme) => theme !== 'factotum' && theme !== 'Unknown'
      );
    }

    themes.forEach((theme) => {
      if (!themeFrequencies[theme]) {
        themeFrequencies[theme] = { count: 0, words: [] };
      }
      themeFrequencies[theme].count += 1;
      if (!themeFrequencies[theme].words.includes(word)) {
        themeFrequencies[theme].words.push(word);
      }
    });
  }

  const sortedThemes = Object.entries(themeFrequencies).sort(
    (a, b) => b[1].count - a[1].count
  );
  const themePrincipal = sortedThemes[0]?.[0] || null;
  const motsConcordants = themePrincipal
    ? themeFrequencies[themePrincipal].words
    : [];

  return { themePrincipal, motsConcordants };
}
