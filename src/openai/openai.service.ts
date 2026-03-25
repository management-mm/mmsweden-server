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
        model: 'gpt-5.4',
        temperature: 0.5,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in food processing machinery and industrial equipment.

Translate the text into ${targetLanguage}.

STRICT OUTPUT FORMAT:
Return ONLY the translated text.
No additional text is allowed.

FORBIDDEN:
- comments
- explanations
- notes
- missing information statements
- completeness analysis
- suggestions
- headers
- bullet points

If you include anything other than the translation, the answer is incorrect.

Rules:
- Use industry-standard terminology
- Preserve all numbers, units, and facts
- If needed, silently correct errors in the source
- If no exact equivalent exists, keep the original term
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
        model: 'gpt-5.4',
        temperature: 0.5,
        messages: [
          {
            role: 'system',
            content: `You are an assistant that edits used food-processing and packaging equipment descriptions for a sales website.

Task:
- Improve English: fix spelling, grammar, punctuation, and wording for clarity.
- Keep the description concise and sales-ready.
- Preserve meaning and all factual information.
- Do not remove, contradict, or invent facts.
- Do not change numbers, model names, capacities, dimensions, dates, brands, countries, or technical specs unless they are clearly typos.
- Do not add any missing-information analysis.
- Do not add placeholders such as "Missing info:".
- Do not add comments, notes, headers, bullet points, or extra sections.

Output:
Return only the final edited description in plain text.`,
          },
          {
            role: 'user',
            content: safeDesc,
          },
        ],
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error :', error);
      throw new Error('Failed');
    }
  }

  async translateEmployeeField(
    text: unknown,
    targetLanguage: string,
    field: 'name' | 'description'
  ): Promise<string> {
    const safeText = this.toNonEmptyString(text);
    if (!safeText) return '';

    const systemPrompt =
      field === 'name'
        ? `You are a professional translator for business websites in the industrial equipment sector.

Task:
Translate an employee's NAME into ${targetLanguage}.

Context:
This text belongs to an employee/contact card on a company website.

Rules:
- Return only the translated name
- Keep personal names, surnames, initials, and job titles accurate
- Do not invent or add any information
- Do not add explanations, comments, labels, or notes
- If the name should not be translated, keep it unchanged
- Preserve punctuation and formatting when relevant

Output:
Return ONLY the final translated text.`
        : `You are a professional translator for business websites in the industrial equipment sector.

Task:
Translate an employee's ROLE or SHORT DESCRIPTION into ${targetLanguage}.

Context:
This text belongs to an employee/contact card on a company website.

Rules:
- Use natural, professional language suitable for a company website
- Keep the meaning fully accurate
- Do not add or remove information
- Do not add explanations, comments, labels, or notes
- Preserve names, phone numbers, email addresses, abbreviations, and other factual details exactly
- If the original contains a job title or department name, translate it in a professional and natural way

Output:
Return ONLY the final translated text.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5.4',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: safeText,
          },
        ],
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error translating employee field:', error);
      throw new Error('Employee field translation failed');
    }
  }
}
