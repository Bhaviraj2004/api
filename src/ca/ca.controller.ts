import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CaService } from './ca.service';
import { CreateCaDto } from './dto/create-ca.dto';
import { UpdateCaDto } from './dto/update-ca.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CA)
@Controller('ca')
export class CaController {
  constructor(private caService: CaService) {}

  @Post('profile')
  createProfile(@Request() req: any, @Body() dto: CreateCaDto) {
    return this.caService.createProfile(req.user.id, dto);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateCaDto) {
    return this.caService.updateProfile(req.user.id, dto);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.caService.getProfile(req.user.id);
  }

  @Get('clients')
  getAllClients(@Request() req: any) {
    return this.caService.getAllClients(req.user.id);
  }
}
