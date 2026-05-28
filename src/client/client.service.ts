import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(caUserId: number, dto: CreateClientDto) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const existing = await this.prisma.client.findUnique({
      where: { pan: dto.pan },
    });

    if (existing) {
      throw new ConflictException('Client with this PAN already exists');
    }

    // Check if email already registered
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictException('A user with this email already exists');
    }

    // Password = PAN number (client logs in with email + PAN)
    const hashedPassword = await bcrypt.hash(dto.pan, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        role: 'CLIENT',
      },
    });

    const { email, ...clientData } = dto;

    return this.prisma.client.create({
      data: {
        ...clientData,
        userId: user.id,
        caId: ca.id,
      },
    });
  }

  async findAll(caUserId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    return this.prisma.client.findMany({
      where: { caId: ca.id },
      include: {
        dscTokens: true,
        filings: true,
        documents: true,
        user: { select: { email: true } },
      },
    });
  }

  async findOne(caUserId: number, clientId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        dscTokens: true,
        filings: true,
        documents: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.caId !== ca.id) {
      throw new ForbiddenException('This client does not belong to you');
    }

    return client;
  }
}
