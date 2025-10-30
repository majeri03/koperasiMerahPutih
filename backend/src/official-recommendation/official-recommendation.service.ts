// src/official-recommendation/official-recommendation.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  Scope,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOfficialRecommendationDto } from './dto/create-official-recommendation.dto';
import { UpdateOfficialRecommendationDto } from './dto/update-official-recommendation.dto';
import { RespondOfficialRecommendationDto } from './dto/respond-official-recommendation.dto'; // <-- Impor DTO Respond
import { PrismaService } from 'src/prisma/prisma.service'; // Pastikan path benar
import {
  OfficialRecommendation, // <-- Pastikan ini diimpor
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // <-- Impor DTO User
import { UploadsService } from 'src/uploads/uploads.service'; // <-- TAMBAHKAN
import { REQUEST } from '@nestjs/core'; // <-- TAMBAHKAN
import type { Request } from 'express';
@Injectable({ scope: Scope.REQUEST })
export class OfficialRecommendationService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  /**
   * Membuat (mencatat) anjuran baru dari pejabat.
   * Dijalankan HANYA oleh Pengurus.
   */
  async create(
    createDto: CreateOfficialRecommendationDto,
  ): Promise<OfficialRecommendation> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const newRecommendation =
        await prismaTenant.officialRecommendation.create({
          data: {
            ...createDto,
            // Kolom 1 (No Urut) dan 2 (Tanggal) otomatis
          },
        });
      return newRecommendation;
    } catch (error) {
      console.error('Gagal membuat anjuran pejabat:', error);
      throw new Error('Gagal menyimpan anjuran pejabat baru.');
    }
  }

  /**
   * Mendapatkan semua anjuran pejabat.
   * Dijalankan oleh Pengurus atau Anggota.
   */
  async findAll() {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    return prismaTenant.officialRecommendation.findMany({
      orderBy: {
        date: 'desc', // Tampilkan yang terbaru
      },
      include: {
        responseByUser: {
          // Kolom 8: TANDA TANGAN PENGURUS (Nama)
          select: { fullName: true },
        },
      },
    });
  }

  /**
   * Mendapatkan satu anjuran pejabat.
   * Dijalankan oleh Pengurus atau Anggota.
   */
  async findOne(id: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const recommendation =
        await prismaTenant.officialRecommendation.findUniqueOrThrow({
          where: { id },
          include: {
            responseByUser: {
              // Kolom 8: TANDA TANGAN PENGURUS (Nama)
              select: { fullName: true },
            },
          },
        });
      return recommendation;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Anjuran pejabat dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari anjuran pejabat ${id}:`, error);
      throw new Error('Gagal mengambil data anjuran pejabat.');
    }
  }

  /**
   * Memperbarui data asli anjuran (Kolom 3-6).
   * Dijalankan HANYA oleh Pengurus.
   */
  async update(
    id: string,
    updateDto: UpdateOfficialRecommendationDto,
  ): Promise<OfficialRecommendation> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const updatedRecommendation =
        await prismaTenant.officialRecommendation.update({
          where: { id },
          data: updateDto,
        });
      return updatedRecommendation;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Anjuran pejabat dengan ID ${id} tidak ditemukan untuk diupdate.`,
        );
      }
      console.error(`Gagal mengupdate anjuran pejabat ${id}:`, error);
      throw new Error('Gagal mengupdate data anjuran pejabat.');
    }
  }

  /**
   * Menambahkan tanggapan Pengurus (Kolom 7 & 8).
   * Dijalankan HANYA oleh Pengurus.
   */
  async respond(
    id: string,
    respondDto: RespondOfficialRecommendationDto,
    user: JwtPayloadDto, // Info Pengurus yang menanggapi
  ): Promise<OfficialRecommendation> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pengurusUserId = user.userId;

    // Pastikan anjuran ada
    const recommendation = await prismaTenant.officialRecommendation.findUnique(
      {
        where: { id },
        select: { id: true },
      },
    );
    if (!recommendation) {
      throw new NotFoundException(
        `Anjuran pejabat dengan ID ${id} tidak ditemukan.`,
      );
    }

    try {
      // Update anjuran dengan tanggapan
      const respondedRecommendation =
        await prismaTenant.officialRecommendation.update({
          where: { id },
          data: {
            response: respondDto.response, // Kolom 7
            responseByUserId: pengurusUserId, // Kolom 8 (ID Pengurus)
            responseAt: new Date(),
          },
        });
      return respondedRecommendation;
    } catch (error) {
      console.error(`Gagal menanggapi anjuran pejabat ${id}:`, error);
      throw new Error('Gagal menyimpan tanggapan anjuran.');
    }
  }

  /**
   * Menghapus anjuran pejabat.
   * Dijalankan HANYA oleh Pengurus.
   */
  async remove(id: string): Promise<OfficialRecommendation> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedRecommendation =
        await prismaTenant.officialRecommendation.delete({
          where: { id },
        });
      return deletedRecommendation;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Anjuran pejabat dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus anjuran pejabat ${id}:`, error);
      throw new Error('Gagal menghapus data anjuran pejabat.');
    }
  }
  /**
   * (Pengurus) Mengunggah atau memperbarui file dokumen anjuran.
   */
  async updateDocument(
    id: string,
    file: Express.Multer.File,
  ): Promise<OfficialRecommendation> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const tenantId = this.request.tenantId;

    if (!tenantId) {
      throw new InternalServerErrorException(
        'Tenant ID tidak ditemukan untuk upload dokumen anjuran.',
      );
    }

    // 1. Pastikan anjuran pejabat ada & ambil URL lama (jika ada)
    const currentRecommendation = await this.findOne(id);
    const oldDocumentUrl = currentRecommendation.documentUrl;

    // 2. Tentukan folder path
    const folderPath = `tenants/${tenantId}/official-recommendations/${id}`;

    try {
      // 3. Upload file baru
      const { url } = await this.uploadsService.uploadFile(file, folderPath);

      // 4. Update URL di database
      const updatedRecommendation =
        await prismaTenant.officialRecommendation.update({
          where: { id: id },
          data: { documentUrl: url },
        });

      // 5. Hapus file lama SETELAH upload & update DB sukses
      if (oldDocumentUrl && oldDocumentUrl !== url) {
        await this.uploadsService.deleteFile(oldDocumentUrl).catch((err) => {
          console.error(
            `[OfficialRecService] Gagal hapus dokumen lama ${oldDocumentUrl} untuk ID ${id}:`,
            err,
          );
          // Jangan gagalkan proses utama jika hapus file lama gagal
        });
      }

      return updatedRecommendation;
    } catch (error) {
      console.error(`Gagal upload dokumen anjuran ${id}:`, error);
      if (error instanceof NotFoundException) throw error; // Dari findOneById
      throw new InternalServerErrorException(
        'Gagal mengunggah dokumen anjuran.',
      );
    }
  }
}
