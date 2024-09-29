import { Injectable } from '@nestjs/common';
import { DeepLService } from 'src/deep-l/deep-l.service';
import { MultiLanguageString, LanguageKeys } from 'src/common/types/language.types';
import { TargetLanguageCode } from 'deepl-node';

@Injectable()
export class TranslationService {
  constructor(private readonly deepLService: DeepLService) {}

  async translateText(text: string, sourceLanguage: 'sv' | 'en'): Promise<MultiLanguageString> {
    const translations: Partial<MultiLanguageString> = {};
    const targetLanguages: TargetLanguageCode[] = [
      sourceLanguage === 'sv' ? "en-US" : 'sv',
      "de",
      "fr",
      "es",
      "ru",
      "uk"
    ];

    const promises = targetLanguages.map(async (lang) => {
      const translatedText = await this.deepLService.translate(text, lang);
      if (lang === 'en-US') {
        translations['en'] = translatedText;
        return;
      }
      translations[lang] = translatedText;
      translations[sourceLanguage] = text
      
    });

    await Promise.all(promises);

    return translations as MultiLanguageString;
  }
}