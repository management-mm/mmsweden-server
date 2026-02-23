import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class ContactUsRequestDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  // @IsNotEmpty()
  @IsString()
  countryPhone: string;

  @IsOptional()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
