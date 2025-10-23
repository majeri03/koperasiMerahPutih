// src/supervisory-suggestion/supervisory-suggestion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupervisorySuggestionDto } from './dto/create-supervisory-suggestion.dto';
import { UpdateSupervisorySuggestionDto } from './dto/update-supervisory-suggestion.dto';
import { RespondSupervisorySuggestionDto } from './dto/respond-supervisory-suggestion.dto'; // <-- Impor DTO Respond
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Prisma,
  PrismaClient,
  SupervisorySuggestion, // <-- Pastikan ini diimpor
} from '@prisma/client';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // <-- Impor DTO User

@Injectable()
export class SupervisorySuggestionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Membuat (mencatat) saran baru dari pengawas.
   * Dijalankan oleh Pengurus.
   */
  async create(
    createDto: CreateSupervisorySuggestionDto,
  ): Promise<SupervisorySuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Verifikasi apakah Member Pengawas yang di-input ada
    const supervisorMember = await prismaTenant.member.findUnique({
      where: { id: createDto.supervisorMemberId },
      select: { id: true },
    });

    if (!supervisorMember) {
      throw new NotFoundException(
        `Anggota (Pengawas) dengan ID ${createDto.supervisorMemberId} tidak ditemukan.`,
      );
    }
    // TODO: Bisa ditambahkan validasi apakah member tsb benar-benar Pengawas aktif
    // (query ke supervisoryPositions), tapi untuk saat ini, validasi member cukup.

    try {
      const newSuggestion = await prismaTenant.supervisorySuggestion.create({
        data: {
          ...createDto,
          // Kolom 1 (No Urut) dan 2 (Tanggal) otomatis
        },
      });
      return newSuggestion;
    } catch (error) {
      console.error('Gagal membuat saran pengawas:', error);
      throw new Error('Gagal menyimpan saran pengawas baru.');
    }
  }

  /**
   * Mendapatkan semua saran pengawas.
   * Dijalankan oleh Pengurus.
   */
  async findAll() {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    return prismaTenant.supervisorySuggestion.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        supervisorMember: {
          // Kolom 3: NAMA PENGAWAS
          select: { fullName: true },
        },
        responseByUser: {
          // Kolom 6: TANDA TANGAN PENGURUS (Nama)
          select: { fullName: true },
        },
      },
    });
  }

  /**
   * Mendapatkan satu saran pengawas.
   * Dijalankan oleh Pengurus.
   */
  async findOne(id: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const suggestion =
        await prismaTenant.supervisorySuggestion.findUniqueOrThrow({
          where: { id },
          include: {
            supervisorMember: {
              select: { fullName: true },
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
          `Saran pengawas dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari saran pengawas ${id}:`, error);
      throw new Error('Gagal mengambil data saran pengawas.');
    }
  }

  /**
   * Memperbarui data asli saran (Kolom 3, 4, 5).
   * Dijalankan oleh Pengurus.
   */
  async update(
    id: string,
    updateDto: UpdateSupervisorySuggestionDto,
  ): Promise<SupervisorySuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const updatedSuggestion = await prismaTenant.supervisorySuggestion.update(
        {
          where: { id },
          data: updateDto,
        },
      );
      return updatedSuggestion;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Saran pengawas dengan ID ${id} tidak ditemukan untuk diupdate.`,
        );
      }
      console.error(`Gagal mengupdate saran pengawas ${id}:`, error);
      throw new Error('Gagal mengupdate data saran pengawas.');
    }
  }

  /**
   * Menambahkan tanggapan Pengurus (Kolom 6 & 7).
   * Dijalankan oleh Pengurus.
   */
  async respond(
    id: string,
    respondDto: RespondSupervisorySuggestionDto,
    user: JwtPayloadDto, // Info Pengurus yang menanggapi
  ): Promise<SupervisorySuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pengurusUserId = user.userId;

    // Pastikan saran ada
    const suggestion = await prismaTenant.supervisorySuggestion.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!suggestion) {
      throw new NotFoundException(
        `Saran pengawas dengan ID ${id} tidak ditemukan.`,
      );
    }

    try {
      // Update saran dengan tanggapan
      const respondedSuggestion =
        await prismaTenant.supervisorySuggestion.update({
          where: { id },
          data: {
            response: respondDto.response, // Kolom 7
            responseByUserId: pengurusUserId, // Kolom 6 (ID Pengurus)
            responseAt: new Date(),
          },
        });
      return respondedSuggestion;
    } catch (error) {
      console.error(`Gagal menanggapi saran pengawas ${id}:`, error);
      throw new Error('Gagal menyimpan tanggapan saran.');
    }
  }

  /**
   * Menghapus saran pengawas.
   * Dijalankan oleh Pengurus.
   */
  async remove(id: string): Promise<SupervisorySuggestion> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedSuggestion = await prismaTenant.supervisorySuggestion.delete(
        {
          where: { id },
        },
      );
      return deletedSuggestion;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Saran pengawas dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus saran pengawas ${id}:`, error);
      throw new Error('Gagal menghapus data saran pengawas.');
    }
  }
}
