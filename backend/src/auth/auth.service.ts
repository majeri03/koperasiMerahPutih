import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { EmailService } from 'src/email/email.service';
import * as crypto from 'crypto';
import { PrismaClient, PasswordResetToken } from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;
    const prismaTenant = await this.prisma.getTenantClient();

    const user = await prismaTenant.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Kredensial tidak valid.');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshToken(
    userId: string,
    rt: string,
  ): Promise<{ accessToken: string }> {
    const prismaTenant = await this.prisma.getTenantClient();
    const user = await prismaTenant.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Akses Ditolak');
    }

    const rtMatches = await bcrypt.compare(rt, user.hashedRefreshToken);
    if (!rtMatches) {
      throw new ForbiddenException('Akses Ditolak');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: +this.configService.get<string>('JWT_EXPIRES_IN', '900'),
    });

    return { accessToken };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    const prismaTenant = await this.prisma.getTenantClient();
    await prismaTenant.user.update({
      where: { id: userId },
      data: { hashedRefreshToken }, // Ini sekarang akan valid
    });
  }

  private async generateTokens(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: +this.configService.get<string>('JWT_EXPIRES_IN', '900'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: +this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '604800',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }
  async changePassword(
    userPayload: JwtPayloadDto,
    changeDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = changeDto;
    const { userId } = userPayload;

    const prismaTenant = await this.prisma.getTenantClient();

    // 1. Ambil data user saat ini
    const user = await prismaTenant.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      // Ini seharusnya tidak terjadi jika token valid, tapi sebagai pengaman
      throw new UnauthorizedException('User tidak ditemukan.');
    }

    // 2. Verifikasi password lama
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Password lama Anda salah.');
    }

    // 3. Hash password baru
    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 4. Update password di database
    await prismaTenant.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        // (Opsional) Nonaktifkan refresh token lama untuk keamanan
        hashedRefreshToken: null,
      },
    });

    return { message: 'Password berhasil diperbarui.' };
  }
  async handleForgotPassword(email: string): Promise<{ message: string }> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    const user = await prismaTenant.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true },
    });

    if (!user) {
      console.warn(
        `[AuthService] Forgot password attempt for non-existent email: ${email}`,
      );
      return {
        message: 'Jika email terdaftar, link reset password akan dikirim.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt();
    const hashedResetToken = await bcrypt.hash(resetToken, salt);

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    try {
      await prismaTenant.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      await prismaTenant.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedResetToken,
          expiresAt: expiryDate,
        },
      });
    } catch (error: any) {
      // Catch block aman
      console.error(
        `[AuthService] Failed to save reset token for user ${user.id}`,
        error,
      );
      throw new InternalServerErrorException(
        'Gagal memproses permintaan reset password.',
      );
    }

    // 5. Buat Link Reset (PERBAIKAN DI SINI)
    const tenantId = this.request.tenantId; // <-- Ambil tenantId dari request
    if (!tenantId) {
      // Ini seharusnya tidak terjadi untuk forgot password, karena pasti diakses via subdomain
      console.error(
        '[AuthService] Tenant ID not found in request during forgot password!',
      );
      throw new InternalServerErrorException(
        'Tidak dapat menentukan koperasi target.',
      );
    }
    // TODO: Ambil base URL frontend dari .env, jangan hardcode 'localhost:3000'
    const frontendDomain = this.configService.get<string>(
      'FRONTEND_DOMAIN',
      'localhost:3000',
    );
    const frontendBaseUrl = `http://${tenantId}.${frontendDomain}`; // <-- Gunakan tenantId
    const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

    const emailHtml = this.emailService.createPasswordResetHtml(
      user.fullName,
      resetLink,
    );
    // Dapatkan nama koperasi untuk sender name (opsional)
    // const tenantInfo = await this.prisma.findTenantInfo(tenantId); // Perlu method helper di PrismaService atau query langsung
    // const senderName = tenantInfo?.name;
    await this.emailService.sendEmail(
      user.email,
      'Reset Password Akun Koperasi Anda',
      emailHtml,
      // senderName // <-- Kirim senderName jika ada
    );

    return {
      message: 'Jika email terdaftar, link reset password akan dikirim.',
    };
  }

  async handleResetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // 1. Cari Record Token
    const potentialTokens = await prismaTenant.passwordResetToken.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: { select: { id: true, status: true } },
      },
    });

    // --- PERBAIKAN INISIALISASI ---
    // Definisikan tipe eksplisit jika perlu, atau biarkan TypeScript infer dari loop
    let validTokenRecord:
      | (PasswordResetToken & { user: { id: string; status: string } })
      | undefined = undefined;
    let userId: string | undefined = undefined; // Gunakan undefined

    // Loop untuk membandingkan hash token
    for (const record of potentialTokens) {
      const isTokenMatch = await bcrypt.compare(token, record.token);
      if (isTokenMatch) {
        validTokenRecord = record; // Tipe sekarang cocok
        userId = record.userId; // Tipe sekarang cocok
        break;
      }
    }

    // 2. Validasi Token (Type Guard)
    // Pengecekan ini memberitahu TypeScript bahwa setelah baris ini,
    // validTokenRecord dan userId PASTI bukan undefined.
    if (!validTokenRecord || !userId) {
      throw new BadRequestException(
        'Token reset password tidak valid atau sudah kedaluwarsa.',
      );
    }

    // (Opsional) Cek status user (Sekarang aksesnya aman)
    if (validTokenRecord.user.status !== 'active') {
      throw new ForbiddenException('Akun pengguna tidak aktif.');
    }

    // 3. Hash Password Baru (Tetap sama)
    const salt = await bcrypt.genSalt();
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 4. Update Password User & Hapus Token (dalam Transaksi)
    try {
      await prismaTenant.$transaction(async (tx) => {
        // Update password user (Akses userId aman)
        await tx.user.update({
          where: { id: userId }, // <-- Aman
          data: {
            passwordHash: newPasswordHash,
            hashedRefreshToken: null,
          },
        });

        // Hapus token reset yang sudah digunakan (Akses .id aman)
        await tx.passwordResetToken.delete({
          where: { id: validTokenRecord.id }, // <-- Aman
        });
      });

      // (Opsional) Kirim notifikasi sukses
      // const userEmail = await prismaTenant.user.findUnique({ where: {id: userId}, select: { email: true }});
      // if (userEmail) await this.emailService.sendPasswordChangeNotification(userEmail.email);

      return { message: 'Password berhasil direset.' };
    } catch (error: any) {
      // Catch block tetap sama
      console.error(
        `[AuthService] Failed to reset password for user ${userId}`,
        error,
      ); // <-- Akses userId di sini juga aman
      throw new InternalServerErrorException('Gagal mereset password.');
    }
  }
}
