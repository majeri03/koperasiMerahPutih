// backend/src/auth/guards/jabatan.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service'; // Sesuaikan path jika perlu
import { JABATAN_KEY, JabatanType } from '../decorators/jabatan.decorator';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { Request } from 'express'; // <-- Import Request from express

// Definisikan interface untuk Request yang memiliki property user
interface RequestWithUser extends Request {
  user: JwtPayloadDto;
}

@Injectable()
export class JabatanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredJabatan = this.reflector.getAllAndOverride<
      JabatanType[] | undefined
    >(JABATAN_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredJabatan || requiredJabatan.length === 0) {
      return true;
    }

    // --- PERUBAHAN DI SINI ---
    // Explicitly type the request object
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user; // Sekarang 'user' memiliki tipe JwtPayloadDto
    // --- AKHIR PERUBAHAN ---

    if (!user || !user.userId || user.role !== 'Pengurus') {
      throw new ForbiddenException(
        'Akses ditolak: Hanya untuk Pengurus dengan jabatan spesifik.',
      );
    }

    try {
      const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

      const activePosition = await prismaTenant.boardPosition.findFirst({
        where: {
          memberId: user.userId,
          jabatan: {
            in: requiredJabatan,
          },
          tanggalBerhenti: null,
        },
        select: {
          id: true,
        },
      });

      if (activePosition) {
        return true;
      } else {
        const allowedJabatans = requiredJabatan.join(' atau ');
        throw new ForbiddenException(
          `Akses ditolak: Anda harus memiliki jabatan "${allowedJabatans}" yang aktif.`,
        );
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('[JabatanGuard] Error:', error);
      throw new ForbiddenException(
        'Akses ditolak karena tidak dapat memverifikasi jabatan.',
      );
    }
  }
}
