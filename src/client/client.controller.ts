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
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.CA)
@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateClientDto) {
    return this.clientService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.clientService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(req.user.id, id);
  }
}
