import { IsString, IsEmail, IsOptional, MinLength, Matches } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName!: string;

  @IsEmail({}, { message: 'Valid email required' })
  email!: string;

  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format' })
  pan!: string;

  @IsOptional()
  @IsString()
  gst?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{12}$/, { message: 'Aadhaar must be 12 digits' })
  aadhaar?: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  address!: string;
}
