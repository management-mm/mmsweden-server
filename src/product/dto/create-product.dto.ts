import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly idNumber: string;

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
