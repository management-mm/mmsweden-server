import { IsInt, Min } from 'class-validator';

export class UpdateCounterDto {
  @IsInt()
  @Min(0)
  seq: number;
}
