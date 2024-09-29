import { Injectable } from '@nestjs/common';
import * as deepl from 'deepl-node';

@Injectable()
export class DeepLService {
  private readonly apiKey: string = process.env.DEEPL_API_KEY;
  private readonly translator: deepl.Translator;

  constructor() {

    this.translator = new deepl.Translator(this.apiKey);
  }


  async translate(text: string, targetLang: deepl.TargetLanguageCode): Promise<string> {
    try {

      const result = await this.translator.translateText(text, null, targetLang);


      return result.text;
    } catch (error) {
      console.error('Error translating text:', error);
      throw new Error('Failed to translate text');
    }
  }
}