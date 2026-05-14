import {
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateDscTokenDto {
  @IsInt()
  clientId!: number;

  @IsString()
  tokenBrand!: string;

  @IsDateString()
  expiryDate!: string;

  @IsBoolean()
  @IsOptional()
  isHeldByCA?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
