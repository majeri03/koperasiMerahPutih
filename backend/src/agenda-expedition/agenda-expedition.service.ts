// src/agenda-expedition/agenda-expedition.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgendaExpeditionDto } from './dto/create-agenda-expedition.dto';
import { UpdateAgendaExpeditionDto } from './dto/update-agenda-expedition.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgendaExpedition, Prisma, PrismaClient } from '@prisma/client';
// import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';

@Injectable()
export class AgendaExpeditionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Membuat entri agenda/ekspedisi baru.
   * Dijalankan HANYA oleh Pengurus.
   */
  async create(
    createDto: CreateAgendaExpeditionDto,
    // user?: JwtPayloadDto, // Opsional: Tambahkan jika ingin log user yg create
  ): Promise<AgendaExpedition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { letterDate, ...restData } = createDto;

    try {
      const newEntry = await prismaTenant.agendaExpedition.create({
        data: {
          ...restData,
          letterDate: new Date(letterDate), // <-- Konversi string ke Date
          // Kolom 1 (No Urut) otomatis
        },
      });
      return newEntry;
    } catch (error) {
      console.error('Gagal membuat entri agenda ekspedisi:', error);
      throw new Error('Gagal menyimpan entri agenda ekspedisi baru.');
    }
  }

  /**
   * Mendapatkan semua entri agenda ekspedisi.
   * Dijalankan oleh Pengurus atau Anggota.
   */
  async findAll(): Promise<AgendaExpedition[]> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    return prismaTenant.agendaExpedition.findMany({
      orderBy: {
        letterDate: 'desc', // Tampilkan surat terbaru lebih dulu
      },
      // Tidak ada relasi yang perlu di-include di sini
    });
  }

  /**
   * Mendapatkan satu entri agenda ekspedisi.
   * Dijalankan oleh Pengurus atau Anggota.
   */
  async findOne(id: string): Promise<AgendaExpedition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const entry = await prismaTenant.agendaExpedition.findUniqueOrThrow({
        where: { id },
      });
      return entry;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Entri agenda ekspedisi dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari agenda ekspedisi ${id}:`, error);
      throw new Error('Gagal mengambil data agenda ekspedisi.');
    }
  }

  /**
   * Memperbarui entri agenda ekspedisi.
   * Dijalankan HANYA oleh Pengurus.
   */
  async update(
    id: string,
    updateDto: UpdateAgendaExpeditionDto,
    // user?: JwtPayloadDto, // Opsional: Tambahkan jika ingin log user yg update
  ): Promise<AgendaExpedition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { letterDate, ...restData } = updateDto;

    try {
      // Pastikan data ada sebelum update
      await this.findOne(id); // Akan throw NotFoundException jika tidak ada

      const updatedEntry = await prismaTenant.agendaExpedition.update({
        where: { id },
        data: {
          ...restData,
          // Konversi tanggal hanya jika ada di DTO pembaruan
          ...(letterDate && { letterDate: new Date(letterDate) }),
        },
      });
      return updatedEntry;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error; // Lempar ulang NotFoundException dari findOne
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025' // Handle jika data dihapus antara findOne dan update
      ) {
        throw new NotFoundException(
          `Entri agenda ekspedisi dengan ID ${id} tidak ditemukan saat mencoba update.`,
        );
      }
      console.error(`Gagal mengupdate agenda ekspedisi ${id}:`, error);
      throw new Error('Gagal mengupdate data agenda ekspedisi.');
    }
  }

  /**
   * Menghapus entri agenda ekspedisi.
   * Dijalankan HANYA oleh Pengurus.
   */
  async remove(id: string): Promise<AgendaExpedition> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedEntry = await prismaTenant.agendaExpedition.delete({
        where: { id },
      });
      return deletedEntry;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Entri agenda ekspedisi dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus agenda ekspedisi ${id}:`, error);
      throw new Error('Gagal menghapus data agenda ekspedisi.');
    }
  }
}
