import { Injectable } from '@nestjs/common';
import { TargetLanguageCode } from 'deepl-node';
import {
  LanguageKeys,
  MultiLanguageString,
} from 'src/common/types/language.types';
import { OpenAIService } from 'src/openai/openai.service';

@Injectable()
export class TranslationService {
  constructor(private readonly openAIService: OpenAIService) {}

  async translateText(
    text: string,
    sourceLanguage: 'sv' | 'en'
  ): Promise<MultiLanguageString> {
    const translations: Partial<MultiLanguageString> = {};
    const targetLanguages: TargetLanguageCode[] = [
      sourceLanguage === 'sv' ? 'en-US' : 'sv',
      'de',
      'fr',
      'es',
      'ru',
      'uk',
    ];

    const promises = targetLanguages.map(async lang => {
      const translatedText = await this.openAIService.translateText(text, lang);
      if (lang === 'en-US') {
        translations['en'] = translatedText;
        return;
      }
      translations[lang] = translatedText;
      translations[sourceLanguage] = text;
    });

    await Promise.all(promises);

    return translations as MultiLanguageString;
  }
}
