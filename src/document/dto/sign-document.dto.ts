import { IsString, IsOptional } from 'class-validator';

export class SignDocumentDto {
  @IsOptional()
  @IsString()
  aadhaarOtp?: string;

  @IsOptional()
  @IsString()
  code?: string;
}
