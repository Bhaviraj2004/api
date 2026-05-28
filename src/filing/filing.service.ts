import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilingDto } from './dto/create-filing.dto';
import { UpdateFilingDto } from './dto/update-filing.dto';

@Injectable()
export class FilingService {
  constructor(private prisma: PrismaService) {}

  async create(caUserId: number, dto: CreateFilingDto) {
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

    return this.prisma.filing.create({
      data: {
        clientId: dto.clientId,
        type: dto.type,
        status: dto.status ?? 'PENDING',
        periodFrom: new Date(dto.periodFrom),
        periodTo: new Date(dto.periodTo),
        notes: dto.notes,
      },
    });
  }

  async getMyFilings(clientUserId: number) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    return this.prisma.filing.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
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

    return this.prisma.filing.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(caUserId: number, filingId: number, dto: UpdateFilingDto) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const filing = await this.prisma.filing.findUnique({
      where: { id: filingId },
      include: { client: true },
    });

    if (!filing) {
      throw new NotFoundException('Filing not found');
    }

    if (filing.client.caId !== ca.id) {
      throw new ForbiddenException(
        'This filing does not belong to your client',
      );
    }

    return this.prisma.filing.update({
      where: { id: filingId },
      data: {
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async getStats(caUserId: number) {
    const ca = await this.prisma.cA.findUnique({
      where: { userId: caUserId },
    });

    if (!ca) {
      throw new NotFoundException('CA profile not found');
    }

    const total = await this.prisma.filing.count({
      where: { client: { caId: ca.id } },
    });

    const pending = await this.prisma.filing.count({
      where: { client: { caId: ca.id }, status: 'PENDING' },
    });

    const completed = await this.prisma.filing.count({
      where: { client: { caId: ca.id }, status: 'COMPLETED' },
    });

    const inProgress = await this.prisma.filing.count({
      where: { client: { caId: ca.id }, status: 'IN_PROGRESS' },
    });

    return { total, pending, completed, inProgress };
  }
}
