import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaDto } from './dto/create-ca.dto';
import { UpdateCaDto } from './dto/update-ca.dto';

@Injectable()
export class CaService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: number, dto: CreateCaDto) {
    const existing = await this.prisma.cA.findUnique({
      where: { userId },
    });

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

  async updateProfile(userId: number, dto: UpdateCaDto) {
    const { avatarUrl, ...caFields } = dto;

    // Update CA profile fields
    const ca = await this.prisma.cA.findUnique({ where: { userId } });
    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const [updatedCa] = await this.prisma.$transaction([
      this.prisma.cA.update({
        where: { userId },
        data: caFields,
      }),
      ...(avatarUrl !== undefined
        ? [
            this.prisma.user.update({
              where: { id: userId },
              data: { avatarUrl },
            }),
          ]
        : []),
    ]);

    return updatedCa;
  }

  async getProfile(userId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId },
      include: {
        clients: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            totpEnabled: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
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
