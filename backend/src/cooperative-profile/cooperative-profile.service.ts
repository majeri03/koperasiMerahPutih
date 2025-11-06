// src/cooperative-profile/cooperative-profile.service.ts
import {
  Injectable,
  NotFoundException,
  Inject,
  Scope,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CooperativeProfile, PrismaClient } from '@prisma/client'; // <-- Impor Model
import { UpdateCooperativeProfileDto } from './dto/update-cooperative-profile.dto'; // <-- Impor DTO
import { UploadsService } from 'src/uploads/uploads.service'; // <-- Tambahkan
import { REQUEST } from '@nestjs/core'; // <-- Tambahkan
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CooperativeProfileService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService, // <-- Inject UploadsService
    @Inject(REQUEST) private request: Request, // <-- Inject Request
  ) {}

  /**
   * Mengambil data profil koperasi (singleton row).
   * Setiap tenant HANYA memiliki satu baris data ini.
   */
  async getProfile(): Promise<CooperativeProfile> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Kita gunakan findFirst() karena kita tahu hanya ada satu baris
    const profile = await prismaTenant.cooperativeProfile.findFirst();

    if (!profile) {
      // Ini seharusnya tidak terjadi jika Tahap 1 (inisialisasi) berhasil
      throw new NotFoundException(
        'Data profil koperasi tidak ditemukan. Harap hubungi administrator.',
      );
    }
    return profile;
  }

  /**
   * Memperbarui data profil koperasi (singleton row).
   */
  async updateProfile(
    updateDto: UpdateCooperativeProfileDto,
  ): Promise<CooperativeProfile> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // 1. Dapatkan dulu ID dari baris profil yang ada
    const currentProfile = await prismaTenant.cooperativeProfile.findFirst({
      select: { id: true }, // Hanya butuh ID
    });

    if (!currentProfile) {
      throw new NotFoundException(
        'Data profil koperasi tidak ditemukan untuk diupdate.',
      );
    }

    // 2. Lakukan update menggunakan ID tersebut
    const updatedProfile = await prismaTenant.cooperativeProfile.update({
      where: { id: currentProfile.id },
      data: updateDto, // DTO kita sudah cocok dengan skema
    });

    return updatedProfile;
  }
  /**
   * (BARU) Method untuk upload logo.
   * 1. Upload file ke R2 via UploadsService.
   * 2. Dapatkan URL.
   * 3. Simpan URL ke database via updateProfile.
   */
  async updateLogo(file: Express.Multer.File): Promise<CooperativeProfile> {
    const tenantId = this.request.tenantId;
    if (!tenantId) {
      // Ini sebagai pengaman, tapi middleware seharusnya sudah menjamin ini ada
      throw new InternalServerErrorException(
        'Tenant ID tidak ditemukan untuk upload.',
      );
    }

    // Tentukan folder path yang rapi di R2
    const folderPath = `tenants/${tenantId}/profile`;

    // 1. Panggil service upload
    const { url } = await this.uploadsService.uploadFile(file, folderPath);

    // 2. Panggil service update (reuse logic)
    return this.updateProfile({ logoUrl: url });
  }

  async findOnePublic(): Promise<{ displayName: string }> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    const profile = await prismaTenant.cooperativeProfile.findFirst({
      select: {
        displayName: true,
      },
    });

    if (!profile) {
      return { displayName: 'Koperasi Merah Putih' };
    }

    return profile;
  }
}
