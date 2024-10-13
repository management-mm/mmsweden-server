import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class ProductDto {
  @IsNotEmpty()
  @IsString()
  idNumber: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  photo: string;
}

export class RequestQuoteDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  countryPhone: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  company: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  @ArrayMinSize(1, { message: 'At least one product is required' })
  products: ProductDto[];
}
