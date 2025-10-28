// src/admin/super-admin-auth/super-admin-jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SuperAdminJwtPayloadDto } from './dto/super-admin-jwt-payload.dto';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

@Injectable()
export class SuperAdminJwtStrategy extends PassportStrategy(
  Strategy,
  'superadmin-jwt',
) {
  // Beri nama unik 'superadmin-jwt'
  private prismaPublic = new PrismaClient(); // Gunakan client public

  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('SUPERADMIN_JWT_SECRET'); // Gunakan secret berbeda
    if (!secret) {
      throw new Error(
        'SUPERADMIN_JWT_SECRET not found in environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<SuperAdminJwtPayloadDto> {
    // Validasi payload dan pastikan super admin masih ada/valid
    const superAdmin = await this.prismaPublic.superAdmin.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true }, // Ambil data minimal
    });

    if (!superAdmin || superAdmin.email !== payload.email) {
      throw new UnauthorizedException('Invalid super admin token.');
    }

    // Kembalikan payload yang akan ditambahkan ke request.user
    return { sub: superAdmin.id, email: superAdmin.email };
  }

  // Pastikan disconnect saat aplikasi berhenti (opsional tapi baik)
  async onModuleDestroy() {
    await this.prismaPublic.$disconnect();
  }
}
