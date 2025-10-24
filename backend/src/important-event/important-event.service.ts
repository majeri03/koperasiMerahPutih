// src/important-event/important-event.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImportantEventDto } from './dto/create-important-event.dto';
import { UpdateImportantEventDto } from './dto/update-important-event.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Pastikan path benar
import {
  ImportantEvent, // <-- Pastikan ini diimpor
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // <-- Impor DTO User

@Injectable()
export class ImportantEventService {
  constructor(private prisma: PrismaService) {}

  /**
   * Membuat (mencatat) kejadian penting baru.
   * Dijalankan HANYA oleh Pengurus.
   * Secara otomatis mencatat ID Pengurus yang membuat.
   */
  async create(
    createDto: CreateImportantEventDto,
    user: JwtPayloadDto, // Info Pengurus yang mencatat
  ): Promise<ImportantEvent> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pengurusUserId = user.userId;

    try {
      const newEvent = await prismaTenant.importantEvent.create({
        data: {
          ...createDto,
          recordedByUserId: pengurusUserId, // <-- Kolom 6: Tanda Tangan
          // Kolom 1 (No Urut) dan 2 (Tanggal) otomatis
        },
      });
      return newEvent;
    } catch (error) {
      console.error('Gagal membuat catatan kejadian penting:', error);
      throw new Error('Gagal menyimpan catatan kejadian penting baru.');
    }
  }

  /**
   * Mendapatkan semua catatan kejadian penting.
   * Dijalankan oleh Pengurus atau Anggota.
   */
  async findAll() {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    return prismaTenant.importantEvent.findMany({
      orderBy: {
        date: 'desc', // Tampilkan yang terbaru
      },
      include: {
        recordedByUser: {
          // Kolom 6: TANDA TANGAN (Nama Pengurus)
          select: { fullName: true },
        },
      },
    });
  }

  /**
   * Mendapatkan satu catatan kejadian penting.
   * Dijalankan oleh Pengurus atau Anggota.
   */
  async findOne(id: string) {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const event = await prismaTenant.importantEvent.findUniqueOrThrow({
        where: { id },
        include: {
          recordedByUser: {
            // Kolom 6: TANDA TANGAN (Nama Pengurus)
            select: { fullName: true },
          },
        },
      });
      return event;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Catatan kejadian penting dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari kejadian penting ${id}:`, error);
      throw new Error('Gagal mengambil data kejadian penting.');
    }
  }

  /**
   * Memperbarui catatan kejadian penting.
   * Dijalankan HANYA oleh Pengurus.
   * Secara otomatis memperbarui ID Pengurus yang melakukan update.
   */
  async update(
    id: string,
    updateDto: UpdateImportantEventDto,
    user: JwtPayloadDto, // Info Pengurus yang mengupdate
  ): Promise<ImportantEvent> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pengurusUserId = user.userId;

    try {
      // Pastikan data ada sebelum update
      await this.findOne(id); // Akan throw NotFoundException jika tidak ada

      const updatedEvent = await prismaTenant.importantEvent.update({
        where: { id },
        data: {
          ...updateDto,
          recordedByUserId: pengurusUserId, // <-- Update juga siapa yg terakhir edit
        },
      });
      return updatedEvent;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error; // Lempar ulang NotFoundException dari findOne
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025' // Handle jika data dihapus antara findOne dan update
      ) {
        throw new NotFoundException(
          `Catatan kejadian penting dengan ID ${id} tidak ditemukan saat mencoba update.`,
        );
      }
      console.error(`Gagal mengupdate kejadian penting ${id}:`, error);
      throw new Error('Gagal mengupdate data kejadian penting.');
    }
  }

  /**
   * Menghapus catatan kejadian penting.
   * Dijalankan HANYA oleh Pengurus.
   */
  async remove(id: string): Promise<ImportantEvent> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedEvent = await prismaTenant.importantEvent.delete({
        where: { id },
      });
      return deletedEvent;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Catatan kejadian penting dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus kejadian penting ${id}:`, error);
      throw new Error('Gagal menghapus data kejadian penting.');
    }
  }
}
