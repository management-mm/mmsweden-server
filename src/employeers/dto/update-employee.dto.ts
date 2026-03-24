import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

export class UpdateEmployeeDto {
  @IsNotEmpty()
  @Transform(({ value }) => tryParseJson(value))
  @IsMultiLanguageStringOrString()
  name!: MultiLanguageString;

  @IsNotEmpty()
  @Transform(({ value }) => tryParseJson(value))
  @IsMultiLanguageStringOrString()
  description!: MultiLanguageString;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
