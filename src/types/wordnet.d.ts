type SynsetType =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adjective satellite'
  | 'adverb';
type ShortSynsetType = 'n' | 'v' | 'a' | 's' | 'r';

/**
 * !    Antonym
 * @    Hypernym
 * @i    Instance Hypernym
 * ~    Hyponym
 * ~i    Instance Hyponym
 * #m    Member holonym
 * #s    Substance holonym
 * #p    Part holonym
 * %m    Member meronym
 * %s    Substance meronym
 * %p    Part meronym
 * =    Attribute
 * +    Derivationally related form
 * ;c    Domain of synset - TOPIC
 * -c    Member of this domain - TOPIC
 * ;r    Domain of synset - REGION
 * -r    Member of this domain - REGION
 * ;u    Domain of synset - USAGE
 * -u    Member of this domain - USAGE
 */
type NounPointerSymbol =
  | '!'
  | '@'
  | '@i'
  | '~'
  | '~i'
  | '#m'
  | '#s'
  | '#p'
  | '%m'
  | '%s'
  | '%p'
  | '='
  | '+'
  | ';c'
  | '-c'
  | ';r'
  | '-r'
  | ';u'
  | '-u';

/**
 * !    Antonym
 * @    Hypernym
 *  ~    Hyponym
 * *    Entailment
 * >    Cause
 * ^    Also see
 * $    Verb Group
 * +    Derivationally related form
 * ;c    Domain of synset - TOPIC
 * ;r    Domain of synset - REGION
 * ;u    Domain of synset - USAGE
 */
type VerbPointerSymbol =
  | '!'
  | '@'
  | '~'
  | '*'
  | '>'
  | '^'
  | '$'
  | '+'
  | ';c'
  | ';r'
  | ';u';

/**
 * !    Antonym
 * &    Similar to
 * <    Participle of verb
 * \    Pertainym (pertains to noun)
 * =    Attribute
 * ^    Also see
 * ;c    Domain of synset - TOPIC
 * ;r    Domain of synset - REGION
 * ;u    Domain of synset - USAGE
 */
type AdjectivePointerSymbol =
  | '!'
  | '&'
  | '<'
  | '\\'
  | '='
  | '^'
  | ';c'
  | ';r'
  | ';u';

/**
 * !    Antonym
 * \    Derived from adjective
 * ;c    Domain of synset - TOPIC
 * ;r    Domain of synset - REGION
 * ;u    Domain of synset - USAGE
 */
type AdverbPointerSymbol = '!' | '/' | ';r' | ';r' | ';u';

type PointerSymbol =
  | NounPointerSymbol
  | VerbPointerSymbol
  | AdverbPointerSymbol
  | AdjectivePointerSymbol;

type Definition = {
  meta: {
    synsetOffset: number;
    lexFilenum: number;
    synsetType: SynsetType;
    wordCount: number;
    words: { word: string; lexId: number }[];
    pointerCount: number;
    pointers: {
      pointerSymbol: PointerSymbol;
      synsetOffset: number;
      /** Part of speech */
      pos: ShortSynsetType;
      sourceTargetHex: string;
      data: Definition;
    }[];
  };
  glossary: string;
};

declare module 'wordnet' {
  type SynsetType =
    | 'noun'
    | 'verb'
    | 'adjective'
    | 'adjective satellite'
    | 'adverb';
  type ShortSynsetType = 'n' | 'v' | 'a' | 's' | 'r';

  interface Pointer {
    pointerSymbol: string;
    synsetOffset: number;
    pos: ShortSynsetType;
    sourceTargetHex: string;
  }

  interface WordDefinition {
    meta: {
      synsetOffset: number;
      lexFilenum: number;
      synsetType: SynsetType;
      words: { word: string; lexId: number }[];
      pointers: Pointer[];
    };
    glossary: string;
  }

  export function init(databaseDir?: string): Promise<void>;
  export function lookup(
    word: string,
    skipPointers?: boolean
  ): Promise<WordDefinition[]>;
}
