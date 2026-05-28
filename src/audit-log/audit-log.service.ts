import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AuditAction =
  | 'USER_REGISTERED'
  | 'USER_LOGGED_IN'
  | 'CA_PROFILE_CREATED'
  | 'CLIENT_CREATED'
  | 'DSC_TOKEN_CREATED'
  | 'FILING_CREATED'
  | 'FILING_STATUS_UPDATED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_SIGNED'
  | 'TOTP_ENABLED';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    action: AuditAction;
    entityType: string;
    entityId: number;
    performedBy: number;
    ipAddress?: string;
    txHash?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        performedBy: data.performedBy,
        ipAddress: data.ipAddress,
        txHash: data.txHash,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.auditLog.findMany({
      where: { performedBy: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEntity(entityType: string, entityId: number) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
