import { IsInt, IsEnum, IsDateString, IsOptional, IsString } from 'class-validator';
import { FilingType, FilingStatus } from '@prisma/client';

export class CreateFilingDto {
  @IsInt()
  clientId: number;

  @IsEnum(FilingType, { message: 'Invalid filing type' })
  type: FilingType;

  @IsEnum(FilingStatus)
  @IsOptional()
  status?: FilingStatus;

  @IsDateString()
  periodFrom: string;

  @IsDateString()
  periodTo: string;

  @IsString()
  @IsOptional()
  notes?: string;
}