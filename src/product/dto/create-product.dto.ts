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

  @IsOptional()
  @IsString()
  readonly idNumber?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  autoGenerateId?: boolean;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  photos: File[];

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  industries?: string;

  @IsNotEmpty()
  @IsEnum(['used', 'new'])
  condition: 'used' | 'new';

  @IsNotEmpty()
  @IsString()
  seoCategoryId: string;

  @IsNotEmpty()
  @IsString()
  seoSubcategoryId: string;

  @IsNotEmpty()
  @IsString()
  productCategoryId: string;
}
