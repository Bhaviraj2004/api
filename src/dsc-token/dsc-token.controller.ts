import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DscTokenService } from './dsc-token.service';
import { CreateDscTokenDto } from './dto/create-dsc-token.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CA)
@Controller('dsc-tokens')
export class DscTokenController {
  constructor(private dscTokenService: DscTokenService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateDscTokenDto) {
    return this.dscTokenService.create(req.user.id, dto);
  }

  @Get('expiring-soon')
  getExpiringSoon(@Request() req: any) {
    return this.dscTokenService.getExpiringSoon(req.user.id);
  }

  @Get('client/:clientId')
  findAllByClient(
    @Request() req: any,
    @Param('clientId', ParseIntPipe) clientId: number,
  ) {
    return this.dscTokenService.findAllByClient(req.user.id, clientId);
  }
}
