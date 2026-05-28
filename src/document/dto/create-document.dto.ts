import { IsInt, IsString, IsUrl, IsOptional, IsIn } from 'class-validator';

export class CreateDocumentDto {
  @IsInt()
  clientId!: number;

  @IsString()
  fileName!: string;

  @IsUrl({}, { message: 'Invalid file URL' })
  fileUrl!: string;

  @IsOptional()
  @IsString()
  @IsIn(['EMAIL', 'TOTP'])
  signingMethod?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CA', 'CLIENT'])
  uploadedBy?: string;
}
