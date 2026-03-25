import { IsEmail, IsOptional, IsString, Validate } from 'class-validator';
import { MultiLanguageString } from 'src/common/types/language.types';
import { IsMultiLanguageStringOrString } from 'src/common/validators/IsMultiLanguageStringOrString';

export class UpdateEmployeeDto {
  @IsOptional()
  @Validate(IsMultiLanguageStringOrString)
  name?: MultiLanguageString;

  @IsOptional()
  @Validate(IsMultiLanguageStringOrString)
  description?: MultiLanguageString;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
