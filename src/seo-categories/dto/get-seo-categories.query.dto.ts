import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetSeoCategoriesQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activeOnly?: boolean = true;
}
