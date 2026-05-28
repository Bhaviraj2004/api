import { IsString, IsOptional, MinLength, IsUrl } from 'class-validator';

export class UpdateCaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firmName?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
