// src/admin/super-admin-auth/super-admin-auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule & Service
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminAuthController } from './super-admin-auth.controller';
import { SuperAdminJwtStrategy } from './super-admin-jwt.strategy';
import { SuperAdminRefreshTokenStrategy } from './super-admin-refresh-token.strategy';
@Module({
  imports: [
    ConfigModule, // Pastikan ConfigModule diimpor
    PassportModule.register({ defaultStrategy: 'superadmin-jwt' }), // Strategi default bisa beda
    JwtModule.register({}), // Register kosong, konfigurasi di service/strategy
  ],
  controllers: [SuperAdminAuthController],
  providers: [
    SuperAdminAuthService,
    SuperAdminJwtStrategy,
    SuperAdminRefreshTokenStrategy,
  ],
  exports: [SuperAdminAuthService],
})
export class SuperAdminAuthModule {}
