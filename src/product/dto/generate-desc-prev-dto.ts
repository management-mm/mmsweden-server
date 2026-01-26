import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateDescriptionPreviewDto {
  @IsNotEmpty()
  @IsString()
  readonly description: string;
}
