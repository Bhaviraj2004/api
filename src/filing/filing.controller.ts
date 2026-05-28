import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FilingService } from './filing.service';
import { CreateFilingDto } from './dto/create-filing.dto';
import { UpdateFilingDto } from './dto/update-filing.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Controller('filings')
export class FilingController {
  constructor(private filingService: FilingService) {}

  // CLIENT-only route — must be declared before the CA-only routes
  // so NestJS route matching picks it up before ':id' or ':clientId' patterns
  @Roles(Role.CLIENT)
  @Get('client/me')
  getMyFilings(@Request() req: any) {
    return this.filingService.getMyFilings(req.user.id);
  }

  @Roles(Role.CA)
  @Post()
  create(@Request() req: any, @Body() dto: CreateFilingDto) {
    return this.filingService.create(req.user.id, dto);
  }

  @Roles(Role.CA)
  @Get('stats')
  getStats(@Request() req: any) {
    return this.filingService.getStats(req.user.id);
  }

  @Roles(Role.CA)
  @Get('client/:clientId')
  findAllByClient(
    @Request() req: any,
    @Param('clientId', ParseIntPipe) clientId: number,
  ) {
    return this.filingService.findAllByClient(req.user.id, clientId);
  }

  @Roles(Role.CA)
  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFilingDto,
  ) {
    return this.filingService.updateStatus(req.user.id, id, dto);
  }
}
