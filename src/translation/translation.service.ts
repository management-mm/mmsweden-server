import { Injectable } from '@nestjs/common';
import { TargetLanguageCode } from 'deepl-node';
import { MultiLanguageString } from 'src/common/types/language.types';
import { OpenAIService } from 'src/openai/openai.service';

@Injectable()
export class TranslationService {
  constructor(private readonly openAIService: OpenAIService) {}

  private normalizeInput(text: unknown): string | null {
    if (typeof text !== 'string') return null;
    const t = text.trim();
    if (!t) return null;

    if (t === 'null' || t === 'undefined') return null;

    return t;
  }

  async translateText(
    text: string,
    sourceLanguage: 'sv' | 'en'
  ): Promise<MultiLanguageString> {
    const normalized = this.normalizeInput(text);

    if (!normalized) {
      return {
        en: sourceLanguage === 'en' ? '' : '',
        sv: sourceLanguage === 'sv' ? '' : '',
        de: '',
        fr: '',
        es: '',
        ru: '',
        uk: '',
      };
    }
    const translations: Partial<MultiLanguageString> = {
      [sourceLanguage]: normalized,
    };

    const targetLanguages: TargetLanguageCode[] = [
      sourceLanguage === 'sv' ? 'en-US' : 'sv',
      'de',
      'fr',
      'es',
      'ru',
      'uk',
    ];

    await Promise.all(
      targetLanguages.map(async lang => {
        try {
          const translatedText = await this.openAIService.translateText(
            normalized,
            lang
          );

          if (lang === 'en-US') {
            translations.en = translatedText?.trim?.()
              ? translatedText
              : normalized;
            return;
          }

          const key = lang as keyof MultiLanguageString;
          translations[key] = translatedText?.trim?.()
            ? translatedText
            : normalized;
        } catch (e) {
          if (lang === 'en-US') translations.en = normalized;
          else translations[lang as keyof MultiLanguageString] = normalized;
        }
      })
    );

    if (!translations.en)
      translations.en = sourceLanguage === 'en' ? normalized : normalized;
    if (!translations.sv)
      translations.sv = sourceLanguage === 'sv' ? normalized : normalized;

    return translations as MultiLanguageString;
  }
}
