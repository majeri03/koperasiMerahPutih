// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// Impor UpdateUserDto jika Anda akan menggunakannya nanti
// import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { Role } from 'src/auth/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * (Hanya Pengurus) Membuat akun User baru untuk Member yang sudah ada.
   */
  async create(createDto: CreateUserDto) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { memberId, email, password } = createDto;

    try {
      const result = await prismaTenant.$transaction(async (tx) => {
        // 1. Validasi: Cek apakah Member (Anggota) ada
        const member = await tx.member.findUnique({
          where: { id: memberId },
          select: { id: true, fullName: true }, // Ambil fullName untuk data User
        });
        if (!member) {
          throw new NotFoundException(
            `Anggota dengan ID ${memberId} tidak ditemukan.`,
          );
        }

        // 2. Validasi: Cek apakah User (Akun) SUDAH ADA untuk memberId ini
        const existingUserForMember = await tx.user.findUnique({
          where: { id: memberId },
        });
        if (existingUserForMember) {
          throw new ConflictException(
            `Anggota ini (ID: ${memberId}) sudah memiliki akun login.`,
          );
        }

        // 3. Validasi: Cek apakah Email SUDAH DIGUNAKAN oleh akun lain
        const existingUserForEmail = await tx.user.findUnique({
          where: { email: email },
        });
        if (existingUserForEmail) {
          throw new ConflictException(
            `Email '${email}' sudah digunakan oleh akun lain.`,
          );
        }

        // 4. Dapatkan Role default "Anggota"
        const anggotaRole = await tx.role.findUnique({
          where: { name: Role.Anggota },
        });
        if (!anggotaRole) {
          throw new InternalServerErrorException(
            "Role 'Anggota' tidak ditemukan. Konfigurasi database tenant rusak.",
          );
        }

        // 5. Hash Password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // 6. Buat User baru
        const newUser = await tx.user.create({
          data: {
            id: memberId, // <-- PENTING: ID User = ID Member
            fullName: member.fullName, // Ambil nama dari data member
            email: email,
            passwordHash: passwordHash,
            roleId: anggotaRole.id, // Role default adalah Anggota
            status: 'active',
          },
        });

        // Hapus hash dari respons
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userResult } = newUser;
        return userResult;
      });

      return result;
    } catch (error) {
      // Lempar ulang error yang sudah kita definisikan
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      // Tangani error lain
      console.error('Gagal membuat akun user manual:', error);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat membuat akun user.',
      );
    }
  }

  // Kita biarkan fungsi lain (findAll, findOne, dll.) untuk saat ini
  // atau tambahkan sesuai kebutuhan Anda.

  findAll() {
    // (Opsional) Tambahkan logika untuk mengambil semua user
    return `This action returns all users (Not Implemented)`;
  }

  findOne(id: string) {
    return `This action returns a #${id} user (Not Implemented)`;
  }

  // update(id: string, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user (Not Implemented)`;
  // }

  remove(id: string) {
    return `This action removes a #${id} user (Not Implemented)`;
  }
}
