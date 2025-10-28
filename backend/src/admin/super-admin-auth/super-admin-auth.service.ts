// src/admin/super-admin-auth/super-admin-auth.service.ts
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import {
  SuperAdminJwtPayloadDto,
  SuperAdminRefreshTokenPayloadDto,
} from './dto/super-admin-jwt-payload.dto';
import type { StringValue } from 'ms';
@Injectable()
export class SuperAdminAuthService {
  private prismaPublic = new PrismaClient(); // Gunakan client public

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(
    loginDto: SuperAdminLoginDto,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    // Refresh token opsional
    const { email, password } = loginDto;

    const superAdmin = await this.prismaPublic.superAdmin.findUnique({
      where: { email },
    });

    if (
      !superAdmin ||
      !(await bcrypt.compare(password, superAdmin.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid super admin credentials.');
    }

    const payload: SuperAdminJwtPayloadDto = {
      sub: superAdmin.id,
      email: superAdmin.email,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload); // Generate refresh token
    await this.updateRefreshTokenHash(superAdmin.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // --- TAMBAHKAN METHOD BARU: refreshToken ---
  async refreshToken(
    userPayload: SuperAdminRefreshTokenPayloadDto,
  ): Promise<{ accessToken: string }> {
    const { sub: userId, refreshToken: rt } = userPayload;

    const superAdmin = await this.prismaPublic.superAdmin.findUnique({
      where: { id: userId },
    });

    // Cek apakah user ada dan punya hash refresh token
    if (!superAdmin || !superAdmin.hashedRefreshToken) {
      throw new ForbiddenException(
        'Access Denied: Super Admin not found or refresh token invalid.',
      );
    }

    // Bandingkan refresh token yang masuk dengan hash di DB
    const rtMatches = await bcrypt.compare(rt, superAdmin.hashedRefreshToken);
    if (!rtMatches) {
      throw new ForbiddenException('Access Denied: Refresh token mismatch.');
    }

    // Jika cocok, generate access token baru
    const newPayload: SuperAdminJwtPayloadDto = {
      sub: superAdmin.id,
      email: superAdmin.email,
    };
    const accessToken = await this.generateAccessToken(newPayload);

    return { accessToken };
  }

  private async generateAccessToken(
    payload: SuperAdminJwtPayloadDto,
  ): Promise<string> {
    const expiresInValue = this.configService.get<string>(
      'SUPERADMIN_JWT_EXPIRES_IN',
      '1h',
    ); // Ambil sebagai string

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('SUPERADMIN_JWT_SECRET'),
      // Langsung gunakan string '1h' atau nilai dari config service
      expiresIn: expiresInValue as StringValue, // <-- Coba casting ke StringValue
    });
  }

  private async generateRefreshToken(
    payload: SuperAdminJwtPayloadDto,
  ): Promise<string> {
    const expiresInValue = this.configService.get<string>(
      'SUPERADMIN_JWT_REFRESH_EXPIRES_IN',
      '7d',
    ); // Ambil dari config
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>(
        'SUPERADMIN_JWT_REFRESH_SECRET',
      ), // Gunakan refresh secret
      expiresIn: expiresInValue as StringValue, // Gunakan refresh expires in
    });
  }
  // --- TAMBAHKAN METHOD BARU: updateRefreshTokenHash ---
  private async updateRefreshTokenHash(
    superAdminId: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const salt = await bcrypt.genSalt();
      const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
      await this.prismaPublic.superAdmin.update({
        where: { id: superAdminId },
        data: { hashedRefreshToken }, // Simpan hash ke kolom yang sesuai
      });
    } catch (error) {
      console.error(
        `[SuperAdminAuthService] Failed to update refresh token hash for ${superAdminId}:`,
        error,
      );
      // Anda bisa memilih untuk melempar error atau hanya log, tergantung kebutuhan
      throw new InternalServerErrorException('Failed to secure session.');
    }
  }
  async onModuleDestroy() {
    await this.prismaPublic.$disconnect();
  }
}
