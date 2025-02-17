import { MultiLanguageString } from 'src/common/types/language.types';

export class UpdateProductDto {
  readonly name: string;
  readonly idNumber: string;
  readonly description: string;
  readonly dimensions: string;
  readonly photos: File[];
  readonly photoQueue: string;
  readonly video: string;
  readonly category: string;
  readonly manufacturer: string;
  readonly industries: string;
  readonly condition: 'used' | 'new';
  readonly deletionDate?: string;
}
