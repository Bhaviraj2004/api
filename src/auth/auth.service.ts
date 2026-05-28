import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) { }

  async register(email: string, password: string, role: 'CA' | 'CLIENT') {
    if (role === 'CLIENT') {
      throw new BadRequestException('Client accounts cannot be registered publicly');
    }
    const normalizedEmail = email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
    });

    await this.auditLog.log({
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      performedBy: user.id,
    });

    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(normalizedPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.auditLog.log({
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user.id,
      performedBy: user.id,
    });

    return this.generateToken(user);
  }

  private generateToken(user: {
    id: number;
    email: string;
    role: 'CA' | 'CLIENT';
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async setupTotp(userId: number) {
    const user = await this.getUserProfile(userId);

    if (user.totpEnabled) {
      throw new BadRequestException('TOTP is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `DSCPlatform:${user.email}`,
      issuer: 'DSC Platform',
    });

    // Save secret temporarily in db
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret.base32,
      },
    });

    // Generate QR Code data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      qrCodeUrl,
      secret: secret.base32,
    };
  }

  async enableTotp(userId: number, code: string) {
    const user = await this.getUserProfile(userId);

    if (!user.totpSecret) {
      throw new BadRequestException('TOTP setup has not been initiated');
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code.trim(),
      window: 1, // allow 30s clock drift
    });

    if (!verified) {
      throw new BadRequestException('Invalid TOTP verification code');
    }

    // Enable TOTP in db
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: true,
      },
    });

    await this.auditLog.log({
      action: 'TOTP_ENABLED',
      entityType: 'User',
      entityId: user.id,
      performedBy: user.id,
    });

    return { success: true };
  }
}
