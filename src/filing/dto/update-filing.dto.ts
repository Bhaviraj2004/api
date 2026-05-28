import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FilingStatus } from '@prisma/client';

export class UpdateFilingDto {
  @IsEnum(FilingStatus, { message: 'Invalid status' })
  status!: FilingStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}