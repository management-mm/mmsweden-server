import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in food processing machines and industrial equipment.
                Your task is to accurately translate the given text into ${targetLanguage}.
                Use industry-specific terminology commonly found in e-commerce platforms and industrial catalogs.
                Maintain natural, professional phrasing suitable for product descriptions.

                Key translation rules:
                - Avoid generic or literal translations. Choose the most commonly used term in the industry.
                - If the source text is ambiguous, prioritize the meaning related to industrial equipment.
                - Keep units of measurement and technical terms unchanged.
                
                **Examples of correct translations:**  
                - "Dicing machines" →  
                   - Swedish (sv): "Tärningsmaskiner"  
                   - English (en-US): "Dicing machines"  
                   - German (de): "Würfelschneider"  
                   - French (fr): "Machines à découper en dés"  
                   - Spanish (es): "Máquinas de corte en cubos"  
                   - Russian (ru): "Шпигорезка"  
                   - Ukrainian (uk): "Шпигорізка"  
                
                - "Grinding machines" →  
                   - Swedish (sv): "Slipmaskiner"  
                   - English (en-US): "Grinding machines"  
                   - German (de): "Schleifmaschinen"  
                   - French (fr): "Machines à meuler"  
                   - Spanish (es): "Máquinas de molienda"  
                   - Russian (ru): "Шлифовальные станки"  
                   - Ukrainian (uk): "Шліфувальні верстати"  
                   
                Use the most appropriate translation based on the target language. If unsure, prioritize terminology used in industrial e-commerce websites.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error translating text:', error);
      throw new Error('Translation failed');
    }
  }
}
