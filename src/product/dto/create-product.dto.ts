import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  readonly slug?: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly idNumber: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  autoGenerateId: boolean;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly dimensions: string;

  readonly photos: File[];

  readonly video: string;

  @IsNotEmpty()
  @IsString()
  readonly category: string;

  readonly manufacturer: string;

  @IsNotEmpty()
  @IsString()
  readonly industries: string;

  @IsNotEmpty()
  @IsEnum(['used', 'new'])
  readonly condition: 'used' | 'new';
}
