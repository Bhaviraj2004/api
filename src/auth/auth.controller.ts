import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtGuard } from './jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.role);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.authService.getUserProfile(req.user.id);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      totpEnabled: user.totpEnabled,
    };
  }

  @UseGuards(JwtGuard)
  @Get('totp/setup')
  setupTotp(@Request() req: any) {
    return this.authService.setupTotp(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Post('totp/enable')
  enableTotp(@Request() req: any, @Body('code') code: string) {
    return this.authService.enableTotp(req.user.id, code);
  }
}
