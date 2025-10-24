import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
}
