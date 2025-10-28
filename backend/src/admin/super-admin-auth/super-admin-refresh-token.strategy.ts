// src/admin/super-admin-auth/super-admin-refresh-token.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuperAdminRefreshTokenPayloadDto } from './dto/super-admin-jwt-payload.dto'; // Reuse or create specific DTO

// Interface untuk payload mentah dari JWT
interface RawSuperAdminJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class SuperAdminRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'superadmin-jwt-refresh', // Nama unik untuk strategi ini
) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('SUPERADMIN_JWT_REFRESH_SECRET'); // Gunakan refresh secret
    if (!secret) {
      throw new Error(
        'SUPERADMIN_JWT_REFRESH_SECRET not found in environment variables.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true, // Agar bisa akses 'req' di validate
    });
  }

  validate(
    req: Request,
    payload: RawSuperAdminJwtPayload,
  ): SuperAdminRefreshTokenPayloadDto {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      // Seharusnya tidak terjadi jika guard dipasang, tapi sebagai pengaman
      throw new UnauthorizedException(
        'Refresh token tidak ditemukan di header.',
      );
    }

    // Kembalikan payload yang digabung dengan refresh token itu sendiri
    return {
      sub: payload.sub,
      email: payload.email,
      refreshToken, // Sertakan refresh token
    };
  }
}
