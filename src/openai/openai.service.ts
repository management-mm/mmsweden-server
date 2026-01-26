import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateDescriptionPreviewDto } from 'src/product/dto/generate-desc-prev-dto';

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
- If a term is unfamiliar or has no direct equivalent, leave it **unchanged** rather than stating it is unrelated or requesting a different term.
- Even if a term does not strictly relate to food processing machines or industrial equipment, still provide the best possible translation based on context.
- Never respond with a message stating that the term is unrelated or unknown. Always attempt to translate or retain the original wording.

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

Use the most appropriate translation based on the target language. If unsure, prioritize terminology used in industrial e-commerce websites.
`,
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

  async generateProductDescription(
    dto: GenerateDescriptionPreviewDto
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are an assistant that edits used food-processing and packaging equipment descriptions for a sales website.

Task:
- Improve English: fix spelling, grammar, punctuation, and wording for clarity.
- Keep the description concise and sales-ready (no fluff, no marketing hype).
- Preserve meaning and ALL factual information. Do NOT remove, contradict, or invent facts.
- Do NOT change numbers, model names, capacities, dimensions, dates, brands, countries, or technical specs unless they are clearly typos.
- If key commercial/technical details are missing, add them only as short “Missing info:” placeholders (do not guess).

Key details to check (placeholders if absent):
Manufacturer, model, year, condition, capacity/output, product type/application, key specs, dimensions, power/voltage, included accessories, materials/contact parts, documentation/CE, location, availability, price (if applicable).

Output:
Return only the final edited description in plain text.
`,
          },
          {
            role: 'user',
            content: dto.description,
          },
        ],
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error :', error);
      throw new Error('Failed');
    }
  }
}
