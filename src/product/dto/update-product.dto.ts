import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MultiLanguageString } from 'src/common/types/language.types';
import { IsMultiLanguageStringOrString } from 'src/common/validators/IsMultiLanguageStringOrString';

const tryParseJson = (value: any) => {
  if (typeof value !== 'string') return value;
  const t = value.trim();
  if (!t.startsWith('{') && !t.startsWith('[')) return value;
  try {
    return JSON.parse(t);
  } catch {
    return value;
  }
};

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(({ value }) => tryParseJson(value))
  @IsMultiLanguageStringOrString()
  name?: string | MultiLanguageString;

  @IsString()
  @IsNotEmpty()
  idNumber!: string;

  @IsOptional()
  @Transform(({ value }) => tryParseJson(value))
  @IsMultiLanguageStringOrString()
  description?: string | MultiLanguageString;

  @IsOptional()
  @IsString()
  dimensions?: string | null;

  @Transform(({ value }) => tryParseJson(value))
  @IsMultiLanguageStringOrString()
  @IsNotEmpty()
  category!: string | MultiLanguageString;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  industries?: string; 

  @IsString()
  @IsIn(['used', 'new'])
  condition!: 'used' | 'new';

  @IsOptional()
  @IsString()
  video?: string | null;

  @IsOptional()
  @IsString()
  photoQueue?: string;

  @IsOptional()
  @IsString()
  deletionDate?: string | null;
}
