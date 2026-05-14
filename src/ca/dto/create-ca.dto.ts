import { IsString, IsPhoneNumber, MinLength } from 'class-validator';

export class CreateCaDto {
  @IsString()
  @MinLength(2, { message: 'Firm name must be at least 2 characters' })
  firmName!: string;

  @IsString()
  @MinLength(3, { message: 'License number must be at least 3 characters' })
  licenseNumber!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  address!: string;
}
