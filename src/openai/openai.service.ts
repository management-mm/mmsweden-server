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

  private toNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const cleaned = value.trim();
    return cleaned.length ? cleaned : null;
  }

  async translateText(text: unknown, targetLanguage: string): Promise<string> {
    const safeText = this.toNonEmptyString(text);
    if (!safeText) return '';

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in food processing machinery and industrial equipment.

Translate the provided text into ${targetLanguage}, correcting any grammar or vocabulary errors in the source. Use accurate, industry-standard terminology typical of industrial catalogs and e-commerce listings. Ensure the result is natural, clear, and suitable for product descriptions.

Rules:

Use common industry terms (avoid literal or generic translations).

Prioritize industrial-equipment meanings when context is unclear.

Preserve units, technical terms, and formatting.

If no exact equivalent exists, keep the original term.

Always provide a translation—never say a term is unknown or irrelevant.

Translate all content, even if not strictly industry-related, using best-fit wording.

Examples:

Dicing machines → sv: Tärningsmaskiner | de: Würfelschneider | fr: Machines à découper en dés

Grinding machines → sv: Slipmaskiner | de: Schleifmaschinen | fr: Machines à meuler

Use terminology consistent with industrial e-commerce usage in the target language.
`,
          },
          {
            role: 'user',
            content: safeText,
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
    const safeDesc = this.toNonEmptyString(dto?.description);
    if (!safeDesc) return '';

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
            content: safeDesc,
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
