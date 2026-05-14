import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDscTokenDto } from './dto/create-dsc-token.dto';

@Injectable()
export class DscTokenService {
  constructor(private prisma: PrismaService) {}

  async create(caUserId: number, dto: CreateDscTokenDto) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.caId !== ca.id) {
      throw new ForbiddenException('This client does not belong to you');
    }

    return this.prisma.dscToken.create({
      data: {
        clientId: dto.clientId,
        tokenBrand: dto.tokenBrand,
        expiryDate: new Date(dto.expiryDate),
        isHeldByCA: dto.isHeldByCA ?? true,
        notes: dto.notes,
      },
    });
  }

  async findAllByClient(caUserId: number, clientId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.caId !== ca.id) {
      throw new ForbiddenException('This client does not belong to you');
    }

    return this.prisma.dscToken.findMany({
      where: { clientId },
    });
  }

  async getExpiringSoon(caUserId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.prisma.dscToken.findMany({
      where: {
        client: { caId: ca.id },
        expiryDate: { lte: thirtyDaysFromNow },
      },
      include: {
        client: {
          select: {
            fullName: true,
            pan: true,
            phone: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
