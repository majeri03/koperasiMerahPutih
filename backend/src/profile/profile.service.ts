// src/profile/profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateMyProfileDto } from './dto/update-profile.dto';
import { Member, PrismaClient } from '@prisma/client'; // <-- Tambahkan Member

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mengambil data profil gabungan (Member + User)
   * untuk pengguna yang sedang login.
   * @param userId ID pengguna dari token JWT
   */
  async getMyProfile(userId: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // 1. Ambil data utama (data pribadi) dari tabel Members
    const member = await prismaTenant.member.findUnique({
      where: { id: userId },
      include: {
        approvedByKetua: { select: { fullName: true } },
        terminationApprovedByKetua: { select: { fullName: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('Data keanggotaan Anda tidak ditemukan.');
    }

    // 2. Ambil data sekunder (email & role) dari tabel Users
    const user = await prismaTenant.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        role: {
          select: { name: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Data akun Anda tidak ditemukan.');
    }

    // 3. Gabungkan kedua hasil query
    const profile = {
      ...member,
      email: user.email,
      role: user.role.name,
    };

    return profile;
  }

  /**
   * (BARU) Memperbarui data profil pengguna yang sedang login.
   * Menggunakan transaksi untuk memastikan konsistensi data
   * antara tabel Members dan Users.
   * @param userId ID pengguna dari token JWT
   * @param updateDto Data yang ingin diubah
   */
  async updateMyProfile(
    userId: string,
    updateDto: UpdateMyProfileDto,
  ): Promise<Member> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { fullName, phoneNumber, signatureData, ...memberData } = updateDto;

    // Kita gunakan $transaction untuk menjamin konsistensi
    const updatedMember = await prismaTenant.$transaction(async (tx) => {
      // 1. Update data di tabel Members
      // Kita gabungkan fullName (jika ada) dan sisa datanya
      const updatedMemberRecord = await tx.member.update({
        where: { id: userId },
        data: {
          ...memberData, // address, occupation
          ...(fullName && { fullName }), // update fullName jika ada
          ...(phoneNumber !== undefined && {
            phoneNumber: phoneNumber || null,
          }),
          ...(signatureData !== undefined && {
            signatureData: signatureData || null,
          }),
        },
      });

      // 2. SINKRONISASI: Jika fullName diubah, update juga tabel Users
      if (fullName) {
        await tx.user.update({
          where: { id: userId },
          data: { fullName: fullName }, // Pastikan data di tabel User sinkron
        });
      }

      return updatedMemberRecord;
    });

    // Kembalikan data member yang sudah diupdate
    // Frontend bisa menggabungkan ini dengan data 'email' dan 'role'
    // yang sudah mereka miliki dari GET /profile/me
    return updatedMember;
  }
}
