// src/member-suggestion/member-suggestion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberSuggestionDto } from './dto/create-member-suggestion.dto';
import { UpdateMemberSuggestionDto } from './dto/update-member-suggestion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MemberSuggestion, // <-- Pastikan ini diimpor dari @prisma/client
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // <-- Impor DTO User
import { RespondMemberSuggestionDto } from './dto/respond-member-suggestion.dto'; // <-- Impor DTO Respond

@Injectable()
export class MemberSuggestionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Membuat saran baru.
   * Dijalankan oleh Anggota (atau Pengurus).
   * Kolom 3 (Nama) & 4 (Alamat) diambil dari ID member yang login.
   */
  async create(
    createDto: CreateMemberSuggestionDto,
    user: JwtPayloadDto, // Ambil info user dari token
  ): Promise<MemberSuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const memberId = user.userId; // ID Anggota yang login

    try {
      const newSuggestion: MemberSuggestion =
        await prismaTenant.memberSuggestion.create({
          data: {
            ...createDto,
            memberId: memberId, // <-- Tautkan saran ke member
          },
        });
      return newSuggestion;
    } catch (error) {
      console.error('Gagal membuat saran anggota:', error);
      throw new Error('Gagal menyimpan saran anggota baru.');
    }
  }

  /**
   * Mendapatkan semua saran.
   * Dijalankan oleh Anggota atau Pengurus.
   * Menyertakan data member dan data penanggap (pengurus).
   */
  async findAll() {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    return prismaTenant.memberSuggestion.findMany({
      orderBy: {
        date: 'desc', // Tampilkan yang terbaru
      },
      include: {
        member: {
          // Untuk Kolom 3 (Nama) & 4 (Alamat)
          select: { fullName: true, address: true },
        },
        responseByUser: {
          // Untuk Kolom 8 (Tanda Tangan Pengurus)
          select: { fullName: true },
        },
      },
    });
  }

  /**
   * Mendapatkan satu saran spesifik.
   * Dijalankan oleh Anggota atau Pengurus.
   */
  async findOne(id: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const suggestion = await prismaTenant.memberSuggestion.findUniqueOrThrow({
        where: { id },
        include: {
          member: {
            select: { fullName: true, address: true },
          },
          responseByUser: {
            select: { fullName: true },
          },
        },
      });
      return suggestion;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Saran anggota dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari saran anggota ${id}:`, error);
      throw new Error('Gagal mengambil data saran anggota.');
    }
  }

  /**
   * Memperbarui isi saran (Kolom 5 atau 6).
   * Dijalankan hanya oleh Pengurus.
   */
  async update(
    id: string,
    updateDto: UpdateMemberSuggestionDto,
  ): Promise<MemberSuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const updatedSuggestion = await prismaTenant.memberSuggestion.update({
        where: { id },
        data: updateDto,
      });
      return updatedSuggestion;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Saran anggota dengan ID ${id} tidak ditemukan untuk diupdate.`,
        );
      }
      console.error(`Gagal mengupdate saran anggota ${id}:`, error);
      throw new Error('Gagal mengupdate data saran anggota.');
    }
  }

  /**
   * Menambahkan tanggapan Pengurus (Kolom 7 & 8).
   * Dijalankan hanya oleh Pengurus.
   */
  async respond(
    id: string,
    respondDto: RespondMemberSuggestionDto,
    user: JwtPayloadDto, // Info Pengurus yang menanggapi
  ): Promise<MemberSuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pengurusUserId = user.userId;

    try {
      // Pastikan saran ada
      const suggestion = await prismaTenant.memberSuggestion.findUnique({
        where: { id },
      });
      if (!suggestion) {
        throw new NotFoundException(
          `Saran anggota dengan ID ${id} tidak ditemukan.`,
        );
      }

      // Update saran dengan tanggapan
      const respondedSuggestion = await prismaTenant.memberSuggestion.update({
        where: { id },
        data: {
          response: respondDto.response, // Kolom 7
          responseByUserId: pengurusUserId, // Kolom 8 (ID Pengurus)
          responseAt: new Date(),
        },
      });
      return respondedSuggestion;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Gagal menanggapi saran ${id}:`, error);
      throw new Error('Gagal menyimpan tanggapan saran.');
    }
  }

  /**
   * Menghapus saran.
   * Dijalankan hanya oleh Pengurus.
   */
  async remove(id: string): Promise<MemberSuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedSuggestion = await prismaTenant.memberSuggestion.delete({
        where: { id },
      });
      return deletedSuggestion;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Saran anggota dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus saran anggota ${id}:`, error);
      throw new Error('Gagal menghapus data saran anggota.');
    }
  }
}
