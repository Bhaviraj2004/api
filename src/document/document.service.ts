// import {
//   Injectable,
//   NotFoundException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateDocumentDto } from './dto/create-document.dto';
// import { SignDocumentDto } from './dto/sign-document.dto';

// @Injectable()
// export class DocumentService {
//   constructor(private prisma: PrismaService) {}

//   async create(caUserId: number, dto: CreateDocumentDto) {
//     const ca = await this.prisma.cA.findUnique({
//       where: { userId: caUserId },
//     });

//     if (!ca) {
//       throw new NotFoundException('CA profile not found');
//     }

//     const client = await this.prisma.client.findUnique({
//       where: { id: dto.clientId },
//     });

//     if (!client) {
//       throw new NotFoundException('Client not found');
//     }

//     if (client.caId !== ca.id) {
//       throw new ForbiddenException('This client does not belong to you');
//     }

//     return this.prisma.document.create({
//       data: {
//         clientId: dto.clientId,
//         fileName: dto.fileName,
//         fileUrl: dto.fileUrl,
//       },
//     });
//   }

//   async findAllByClient(caUserId: number, clientId: number) {
//     const ca = await this.prisma.cA.findUnique({
//       where: { userId: caUserId },
//     });

//     if (!ca) {
//       throw new NotFoundException('CA profile not found');
//     }

//     const client = await this.prisma.client.findUnique({
//       where: { id: clientId },
//     });

//     if (!client) {
//       throw new NotFoundException('Client not found');
//     }

//     if (client.caId !== ca.id) {
//       throw new ForbiddenException('This client does not belong to you');
//     }

//     return this.prisma.document.findMany({
//       where: { clientId },
//       orderBy: { createdAt: 'desc' },
//     });
//   }

//   async signDocument(
//     clientUserId: number,
//     documentId: number,
//     dto: SignDocumentDto,
//   ) {
//     const client = await this.prisma.client.findUnique({
//       where: { userId: clientUserId },
//     });

//     if (!client) {
//       throw new NotFoundException('Client profile not found');
//     }

//     const document = await this.prisma.document.findUnique({
//       where: { id: documentId },
//     });

//     if (!document) {
//       throw new NotFoundException('Document not found');
//     }

//     if (document.clientId !== client.id) {
//       throw new ForbiddenException('This document does not belong to you');
//     }

//     if (document.isSigned) {
//       throw new ForbiddenException('Document already signed');
//     }

//     if (!dto.aadhaarOtp || dto.aadhaarOtp.length < 4) {
//       throw new ForbiddenException('Invalid OTP');
//     }

//     return this.prisma.document.update({
//       where: { id: documentId },
//       data: {
//         isSigned: true,
//         signedAt: new Date(),
//       },
//     });
//   }

//   async getMyDocuments(clientUserId: number) {
//     const client = await this.prisma.client.findUnique({
//       where: { userId: clientUserId },
//     });

//     if (!client) {
//       throw new NotFoundException('Client profile not found');
//     }

//     return this.prisma.document.findMany({
//       where: { clientId: client.id },
//       orderBy: { createdAt: 'desc' },
//     });
//   }
// }

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SignDocumentDto } from './dto/sign-document.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mail: MailService,
  ) {}

  async create(caUserId: number, dto: CreateDocumentDto) {
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

    const document = await this.prisma.document.create({
      data: {
        clientId: dto.clientId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        uploadedBy: dto.uploadedBy || 'CA',
        signingMethod: dto.signingMethod || 'EMAIL',
      },
    });

    await this.auditLog.log({
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: document.id,
      performedBy: caUserId,
    });

    return document;
  }

  async createClientUpload(clientUserId: number, dto: CreateDocumentDto) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    const document = await this.prisma.document.create({
      data: {
        clientId: client.id,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        uploadedBy: 'CLIENT',
        signingMethod: 'EMAIL',
        isSigned: true, // Client uploads are auto-signed (completed)
        signedAt: new Date(),
      },
    });

    await this.auditLog.log({
      action: 'DOCUMENT_UPLOADED',
      entityType: 'Document',
      entityId: document.id,
      performedBy: clientUserId,
    });

    return document;
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

    return this.prisma.document.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendOtp(clientUserId: number, documentId: number) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.clientId !== client.id) {
      throw new ForbiddenException('This document does not belong to you');
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        otpCode: code,
        otpExpiresAt: expiresAt,
      },
    });

    // Fetch client's email via user relation
    const clientWithUser = await this.prisma.client.findUnique({
      where: { id: client.id },
      include: { user: true },
    });

    // Send real email
    await this.mail.sendOtpEmail(
      clientWithUser!.user.email,
      client.fullName,
      code,
      document.fileName,
    );

    return { success: true, message: 'OTP sent to your registered email' };
  }

  async signDocument(
    clientUserId: number,
    documentId: number,
    dto: SignDocumentDto,
  ) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.clientId !== client.id) {
      throw new ForbiddenException('This document does not belong to you');
    }

    if (document.isSigned) {
      throw new ForbiddenException('Document already signed');
    }

    const inputCode = (dto.code || dto.aadhaarOtp || '').trim();

    if (document.signingMethod === 'EMAIL') {
      if (!document.otpCode || !document.otpExpiresAt) {
        throw new ForbiddenException('Please request an OTP first');
      }

      if (new Date() > document.otpExpiresAt) {
        throw new ForbiddenException('OTP has expired');
      }

      if (document.otpCode !== inputCode) {
        throw new ForbiddenException('Invalid OTP code');
      }
    } else if (document.signingMethod === 'TOTP') {
      if (!client.user.totpSecret || !client.user.totpEnabled) {
        throw new ForbiddenException('Google Authenticator is not configured');
      }

      // Verify TOTP via speakeasy
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: client.user.totpSecret,
        encoding: 'base32',
        token: inputCode,
        window: 1, // allow 30s drift
      });

      if (!verified) {
        throw new ForbiddenException('Invalid Google Authenticator code');
      }
    } else {
      if (inputCode.length < 4) {
        throw new ForbiddenException('Invalid code');
      }
    }

    const signed = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        isSigned: true,
        signedAt: new Date(),
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    await this.auditLog.log({
      action: 'DOCUMENT_SIGNED',
      entityType: 'Document',
      entityId: document.id,
      performedBy: clientUserId,
    });

    return signed;
  }

  async getMyDocuments(clientUserId: number) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    return this.prisma.document.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
