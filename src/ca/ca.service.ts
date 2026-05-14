import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaDto } from './dto/create-ca.dto';

@Injectable()
export class CaService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: number, dto: CreateCaDto) {
    console.log('userId:', userId);
    console.log('dto:', dto);

    const existing = await this.prisma.cA.findUnique({
      where: { userId },
    });

    console.log('existing:', existing);

    if (existing) {
      throw new ConflictException('CA profile already exists');
    }

    return this.prisma.cA.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async getProfile(userId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId },
      include: {
        clients: true,
      },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    return ca;
  }

  async getAllClients(userId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    return this.prisma.client.findMany({
      where: { caId: ca.id },
      include: {
        dscTokens: true,
        filings: true,
      },
    });
  }
}
