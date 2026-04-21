import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class HoldReservationDto {
  @IsString()
  @IsNotEmpty()
  groupCode: string;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @Type(() => Number)
  @IsNumber()
  slotId: number;
}