import { IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  readonly name: string;
  @IsOptional()
  @IsString()
  readonly slug?: string;
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
