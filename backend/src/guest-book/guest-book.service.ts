// src/guest-book/guest-book.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuestBookDto } from './dto/create-guest-book.dto';
import { UpdateGuestBookDto } from './dto/update-guest-book.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Pastikan path ini benar
import { GuestBook, Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class GuestBookService {
  constructor(private prisma: PrismaService) {}

  /**
   * Membuat entri buku tamu baru.
   * Ini bisa diakses oleh Tamu, Anggota, dan Pengurus.
   */
  async create(createGuestBookDto: CreateGuestBookDto): Promise<GuestBook> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      // DTO sudah sesuai dengan kolom (kecuali 'date' dan 'entry_number' yang otomatis)
      const newEntry: GuestBook = await prismaTenant.guestBook.create({
        data: createGuestBookDto,
      });
      return newEntry;
    } catch (error) {
      console.error('Gagal membuat entri buku tamu:', error);
      throw new Error('Gagal menyimpan entri buku tamu baru.');
    }
  }

  /**
   * Mendapatkan semua entri buku tamu.
   * Ini bisa diakses oleh Anggota dan Pengurus.
   */
  async findAll(): Promise<GuestBook[]> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const entries: GuestBook[] = await prismaTenant.guestBook.findMany({
      orderBy: {
        date: 'desc', // Tampilkan entri terbaru di atas
      },
    });
    return entries;
  }

  /**
   * Mendapatkan satu entri buku tamu berdasarkan ID.
   * Ini bisa diakses oleh Anggota dan Pengurus.
   */
  async findOne(id: string): Promise<GuestBook> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const entry: GuestBook = await prismaTenant.guestBook.findUniqueOrThrow({
        where: { id },
      });
      return entry;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Entri buku tamu dengan ID ${id} tidak ditemukan.`,
        );
      }
      console.error(`Error saat mencari entri buku tamu ${id}:`, error);
      throw new Error('Gagal mengambil data entri buku tamu.');
    }
  }

  /**
   * Memperbarui entri buku tamu.
   * Ini hanya bisa diakses oleh Pengurus.
   */
  async update(
    id: string,
    updateGuestBookDto: UpdateGuestBookDto,
  ): Promise<GuestBook> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const updatedEntry: GuestBook = await prismaTenant.guestBook.update({
        where: { id },
        data: updateGuestBookDto,
      });
      return updatedEntry;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Entri buku tamu dengan ID ${id} tidak ditemukan untuk diupdate.`,
        );
      }
      console.error(`Gagal mengupdate entri buku tamu ${id}:`, error);
      throw new Error('Gagal mengupdate data entri buku tamu.');
    }
  }

  /**
   * Menghapus entri buku tamu.
   * Ini hanya bisa diakses oleh Pengurus.
   */
  async remove(id: string): Promise<GuestBook> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const deletedEntry: GuestBook = await prismaTenant.guestBook.delete({
        where: { id },
      });
      return deletedEntry;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Entri buku tamu dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus entri buku tamu ${id}:`, error);
      throw new Error('Gagal menghapus data entri buku tamu.');
    }
  }
}
