import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimeslotDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  branchId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  packageId!: number;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  timeSlot!: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quota!: number;
}