export enum LanguageKeys {
  EN = 'en',
  SV = 'sv',
  DE = 'de',
  FR = 'fr',
  ES = 'es',
  RU = 'ru',
  UK = 'uk',
}

export type MultiLanguageString = {
  [key in LanguageKeys]: string;
};
