import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
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
  @IsString()
  phone: string;

  @IsString()
  countryPhone: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsString()
  company: string;

  @IsString()
  message:string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  @ArrayMinSize(1, { message: 'At least one product is required' })
  products: ProductDto[];
}
