import { Injectable } from '@nestjs/common';
import { DeepLService } from 'src/deep-l/deep-l.service';
import { MultiLanguageString, LanguageKeys } from 'src/common/types/language.types';
import { TargetLanguageCode } from 'deepl-node';

@Injectable()
export class TranslationService {
  constructor(private readonly deepLService: DeepLService) {}

  async translateText(text: string, targetLanguages: TargetLanguageCode[]): Promise<MultiLanguageString> {
    const translations: Partial<MultiLanguageString> = {};

    const promises = targetLanguages.map(async (lang) => {
      const translatedText = await this.deepLService.translate(text, lang);
      translations[lang] = translatedText;
    });

    await Promise.all(promises);

    return translations as MultiLanguageString;
  }

  async translateIndustries(industries: string[], targetLanguages: TargetLanguageCode[]): Promise<MultiLanguageString[]> {
    const promises = industries.map(async (industry) => {
      return this.translateText(industry, targetLanguages);
    });

    const translatedIndustries = await Promise.all(promises);

    return translatedIndustries;
  }
}