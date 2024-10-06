import { Injectable } from '@nestjs/common';
import { TargetLanguageCode } from 'deepl-node';
import {
  LanguageKeys,
  MultiLanguageString,
} from 'src/common/types/language.types';
import { DeepLService } from 'src/deep-l/deep-l.service';

@Injectable()
export class TranslationService {
  constructor(private readonly deepLService: DeepLService) {}

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
      const translatedText = await this.deepLService.translate(text, lang);
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
