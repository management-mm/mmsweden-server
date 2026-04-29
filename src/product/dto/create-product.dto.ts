import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

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
  @IsMongoId()
  seoCategoryId: string;

  @IsNotEmpty()
  @IsMongoId()
  seoSubcategoryId: string;

  @IsNotEmpty()
  @IsMongoId()
  productCategoryId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  isDraft?: boolean;
}
