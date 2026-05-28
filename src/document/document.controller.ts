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
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SignDocumentDto } from './dto/sign-document.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Roles(Role.CA)
  @Post()
  create(@Request() req: any, @Body() dto: CreateDocumentDto) {
    return this.documentService.create(req.user.id, dto);
  }

  @Roles(Role.CA)
  @Get('client/:clientId')
  findAllByClient(
    @Request() req: any,
    @Param('clientId', ParseIntPipe) clientId: number,
  ) {
    return this.documentService.findAllByClient(req.user.id, clientId);
  }

  @Roles(Role.CLIENT)
  @Post('client-upload')
  createClientUpload(@Request() req: any, @Body() dto: CreateDocumentDto) {
    return this.documentService.createClientUpload(req.user.id, dto);
  }

  @Roles(Role.CLIENT)
  @Get('my-documents')
  getMyDocuments(@Request() req: any) {
    return this.documentService.getMyDocuments(req.user.id);
  }

  @Roles(Role.CLIENT)
  @Post(':id/send-otp')
  sendOtp(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentService.sendOtp(req.user.id, id);
  }

  @Roles(Role.CLIENT)
  @Patch(':id/sign')
  signDocument(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SignDocumentDto,
  ) {
    return this.documentService.signDocument(req.user.id, id, dto);
  }
}
