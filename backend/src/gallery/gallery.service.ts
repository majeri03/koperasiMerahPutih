// src/gallery/gallery.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
  Scope,
} from '@nestjs/common';
import { CreateGalleryItemDto } from './dto/create-gallery.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GalleryItem, Prisma, PrismaClient } from '@prisma/client';
import { UploadsService } from 'src/uploads/uploads.service';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

export interface PaginatedGalleryResult {
  data: GalleryItem[];
  meta: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({ scope: Scope.REQUEST })
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  /**
   * (Pengurus) Membuat item galeri baru (upload gambar + simpan data).
   */
  async create(
    createDto: CreateGalleryItemDto,
    file: Express.Multer.File,
  ): Promise<GalleryItem> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const tenantId = this.request.tenantId;
    if (!tenantId) {
      throw new InternalServerErrorException('Tenant ID tidak ditemukan.');
    }

    const folderPath = `tenants/${tenantId}/gallery`; // Folder galeri

    try {
      // 1. Upload gambar dulu
      const { url } = await this.uploadsService.uploadFile(file, folderPath);
      let orderValue: number | null = null; // Default ke null
      if (createDto.order !== undefined && createDto.order !== null) {
        // Coba parse jika ada nilainya (bisa string atau number dari DTO)
        const parsedOrder = parseInt(String(createDto.order), 10);
        // Hanya gunakan jika hasil parsing valid (bukan NaN)
        if (!isNaN(parsedOrder)) {
          orderValue = parsedOrder;
        }
      }
      // 2. Simpan data ke database
      const newItem = await prismaTenant.galleryItem.create({
        data: {
          imageUrl: url,
          description: createDto.description,
          order: orderValue,
        },
      });
      return newItem;
    } catch (error) {
      console.error('Gagal membuat item galeri:', error);
      // Jika upload gagal, UploadsService akan melempar error
      // Jika create DB gagal setelah upload, idealnya file di R2 dihapus (rollback manual)
      // tapi untuk simplisitas, kita lempar error server saja dulu
      throw new InternalServerErrorException(
        'Gagal menyimpan item galeri baru.',
      );
    }
  }

  /**
   * (Publik) Mendapatkan daftar item galeri (Pagination).
   */
  async findAll(
    page = 1,
    limit = 12, // Default lebih banyak untuk galeri
  ): Promise<PaginatedGalleryResult> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (pageNum - 1) * limitNum;

    try {
      const items = await prismaTenant.galleryItem.findMany({
        skip: skip,
        take: limitNum,
        orderBy: [
          { order: 'asc' }, // Prioritaskan order
          { createdAt: 'desc' }, // Lalu yang terbaru
        ],
      });
      const totalItems = await prismaTenant.galleryItem.count();
      return {
        data: items,
        meta: {
          currentPage: pageNum,
          perPage: limitNum,
          totalItems: totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
        },
      };
    } catch (error) {
      console.error('Gagal mengambil item galeri:', error);
      throw new InternalServerErrorException('Gagal mengambil daftar galeri.');
    }
  }

  /**
   * (Internal) Helper untuk mencari item berdasarkan ID.
   */
  private async findOneOrFail(
    id: string,
    prismaTenant: PrismaClient,
  ): Promise<GalleryItem> {
    const item = await prismaTenant.galleryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(
        `Item galeri dengan ID "${id}" tidak ditemukan.`,
      );
    }
    return item;
  }

  /**
   * (Pengurus) Memperbarui deskripsi atau urutan item galeri.
   */
  async update(
    id: string,
    updateDto: UpdateGalleryItemDto,
  ): Promise<GalleryItem> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Pastikan item ada
    await this.findOneOrFail(id, prismaTenant);

    try {
      const updatedItem = await prismaTenant.galleryItem.update({
        where: { id: id },
        data: {
          description: updateDto.description,
          order: updateDto.order,
        },
      });
      return updatedItem;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Item galeri ID "${id}" tidak ditemukan saat update.`,
        );
      }
      console.error(`Gagal mengupdate item galeri ${id}:`, error);
      throw new InternalServerErrorException('Gagal memperbarui item galeri.');
    }
  }

  /**
   * (Pengurus) Menghapus item galeri DAN gambar terkaitnya.
   */
  async remove(id: string): Promise<void> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    const itemToDelete = await this.findOneOrFail(id, prismaTenant);
    const imageUrlToDelete = itemToDelete.imageUrl;

    // Hapus file dari R2 (harus ada URL-nya)
    if (imageUrlToDelete) {
      try {
        await this.uploadsService.deleteFile(imageUrlToDelete);
      } catch (fileDeleteError) {
        console.error(
          `Gagal hapus gambar ${imageUrlToDelete} galeri ${id}:`,
          fileDeleteError,
        );
        // Tetap lanjutkan hapus record DB
      }
    } else {
      console.warn(
        `[GalleryService] Item galeri ${id} tidak memiliki imageUrl untuk dihapus.`,
      );
    }

    try {
      await prismaTenant.galleryItem.delete({ where: { id: id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Item galeri ID "${id}" tidak ditemukan saat hapus.`,
        );
      }
      console.error(`Gagal menghapus item galeri ${id} dari DB:`, error);
      throw new InternalServerErrorException('Gagal menghapus item galeri.');
    }
  }
}
