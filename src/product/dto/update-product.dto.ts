import { MultiLanguageString } from 'src/common/types/language.types';

export class UpdateProductDto {
  readonly name: MultiLanguageString;
  readonly idNumber: number;
  readonly description: MultiLanguageString;
  readonly dimensions: string;
  readonly photos: string[];
  readonly video: string;
  readonly category: MultiLanguageString;
  readonly manufacturer: string;
  readonly industry: MultiLanguageString[];
  readonly condition: 'used' | 'new';
}
