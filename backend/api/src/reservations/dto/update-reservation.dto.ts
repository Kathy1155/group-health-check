import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class MedicalProfileDto {
  @IsOptional()
  @IsString()
  bloodType: string;

  @IsOptional()
  @IsString()
  allergies: string;

  @IsOptional()
  @IsString()
  familyHistory: string;

  @IsOptional()
  @IsString()
  chronicDiseases: string;

  @IsOptional()
  @IsString()
  medications: string;
}

export class CreateReservationDto {
  @Type(() => Number)
  @IsNumber()
  reservationId: number;

  @IsString()
  @IsNotEmpty()
  groupCode: string;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @Type(() => Number)
  @IsNumber()
  packageId: number;

  @Type(() => Number)
  @IsNumber()
  slotId: number;

  @IsObject()
  @ValidateNested()
  @Type(() => MedicalProfileDto)
  medicalProfile: MedicalProfileDto;
}