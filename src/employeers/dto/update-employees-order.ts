import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsMongoId,
  Min,
  ValidateNested,
} from 'class-validator';

class UpdateEmployeesOrderItemDto {
  @IsMongoId()
  id: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class UpdateEmployeesOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEmployeesOrderItemDto)
  employees: UpdateEmployeesOrderItemDto[];
}
