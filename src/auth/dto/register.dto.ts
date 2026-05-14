import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Valid email required' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsEnum(Role, { message: 'Role must be CA or CLIENT' })
  role!: Role;
}
