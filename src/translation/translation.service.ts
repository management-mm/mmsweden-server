import { Injectable } from '@nestjs/common';
import { TargetLanguageCode } from 'deepl-node';
import { MultiLanguageString } from 'src/common/types/language.types';
import { OpenAIService } from 'src/openai/openai.service';

type SourceLanguage = 'sv' | 'en';
type EmployeeFieldType = 'name' | 'description';

@Injectable()
export class TranslationService {
  constructor(private readonly openAIService: OpenAIService) {}

  private normalizeInput(text: unknown): string | null {
    if (typeof text !== 'string') return null;

    const t = text.trim();

    if (!t || t === 'null' || t === 'undefined') return null;

    return t;
  }

  private getEmptyTranslations(): MultiLanguageString {
    return {
      en: '',
      sv: '',
      de: '',
      fr: '',
      es: '',
      ru: '',
      uk: '',
      pl: '',
    };
  }

  private getTargetLanguages(
    sourceLanguage: SourceLanguage
  ): TargetLanguageCode[] {
    return [
      sourceLanguage === 'sv' ? 'en-US' : 'sv',
      'de',
      'fr',
      'es',
      'ru',
      'uk',
      'pl',
    ];
  }

  async translateText(
    text: string,
    sourceLanguage: SourceLanguage
  ): Promise<MultiLanguageString> {
    const normalized = this.normalizeInput(text);

    if (!normalized) {
      return this.getEmptyTranslations();
    }

    const translations: Partial<MultiLanguageString> = {
      [sourceLanguage]: normalized,
    };

    const targetLanguages = this.getTargetLanguages(sourceLanguage);

    await Promise.all(
      targetLanguages.map(async lang => {
        try {
          const translatedText = await this.openAIService.translateText(
            normalized,
            lang
          );

          const safeValue = translatedText?.trim?.()
            ? translatedText
            : normalized;

          if (lang === 'en-US') {
            translations.en = safeValue;
            return;
          }

          translations[lang as keyof MultiLanguageString] = safeValue;
        } catch (error) {
          if (lang === 'en-US') {
            translations.en = normalized;
          } else {
            translations[lang as keyof MultiLanguageString] = normalized;
          }
        }
      })
    );

    if (!translations.en) translations.en = normalized;
    if (!translations.sv) translations.sv = normalized;

    return translations as MultiLanguageString;
  }

  async translateEmployeeText(
    text: string,
    sourceLanguage: SourceLanguage,
    field: EmployeeFieldType
  ): Promise<MultiLanguageString> {
    const normalized = this.normalizeInput(text);

    if (!normalized) {
      return this.getEmptyTranslations();
    }

    const translations: Partial<MultiLanguageString> = {
      [sourceLanguage]: normalized,
    };

    const targetLanguages = this.getTargetLanguages(sourceLanguage);

    await Promise.all(
      targetLanguages.map(async lang => {
        try {
          const translatedText =
            await this.openAIService.translateEmployeeField(
              normalized,
              lang,
              field
            );

          const safeValue = translatedText?.trim?.()
            ? translatedText
            : normalized;

          if (lang === 'en-US') {
            translations.en = safeValue;
            return;
          }

          translations[lang as keyof MultiLanguageString] = safeValue;
        } catch (error) {
          if (lang === 'en-US') {
            translations.en = normalized;
          } else {
            translations[lang as keyof MultiLanguageString] = normalized;
          }
        }
      })
    );

    if (!translations.en) translations.en = normalized;
    if (!translations.sv) translations.sv = normalized;

    return translations as MultiLanguageString;
  }
}
