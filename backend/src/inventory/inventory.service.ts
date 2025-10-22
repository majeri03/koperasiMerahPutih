// backend/src/inventory/inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// Impor tipe secara eksplisit, termasuk PrismaClient
import {
  InventoryItem,
  InventoryCondition,
  Prisma,
  PrismaClient,
} from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<InventoryItem> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { quantity, unitPrice, purchaseDate, ...restData } =
      createInventoryDto;

    const totalValue = quantity * unitPrice;
    const itemCode = `INV-${Date.now()}`;
    // Tetapkan default condition dengan casting eksplisit
    const condition =
      createInventoryDto.condition ??
      (InventoryCondition.BAIK as InventoryCondition);

    try {
      // Explicitly type the result if needed, though Prisma client often infers correctly
      const newItem: InventoryItem = await prismaTenant.inventoryItem.create({
        data: {
          ...restData,
          itemCode,
          quantity,
          unitPrice,
          totalValue,
          purchaseDate: new Date(purchaseDate), // Konversi di sini
          condition,
        },
      });
      return newItem;
    } catch (error) {
      console.error('Gagal membuat item inventaris:', error);
      throw new Error('Gagal menyimpan data inventaris baru.');
    }
  }

  async findAll(): Promise<InventoryItem[]> {
    // Tambahkan tipe return eksplisit
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    // Explicitly type the result
    const items: InventoryItem[] = await prismaTenant.inventoryItem.findMany({
      orderBy: {
        purchaseDate: 'desc',
      },
    });
    return items;
  }

  async findOne(id: string): Promise<InventoryItem> {
    // Tambahkan tipe return eksplisit
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    // Gunakan findUniqueOrThrow untuk kepastian tipe dan error handling
    try {
      const item: InventoryItem =
        await prismaTenant.inventoryItem.findUniqueOrThrow({
          where: { id },
        });
      return item;
    } catch (error: unknown) {
      // Tangkap error spesifik P2025 dari Prisma jika record tidak ditemukan
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Item inventaris dengan ID ${id} tidak ditemukan.`,
        );
      }
      // Lempar error lain jika bukan P2025
      console.error(`Error saat mencari inventaris ${id}:`, error);
      throw new Error('Gagal mengambil data inventaris.');
    }
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<InventoryItem> {
    // Tambahkan tipe return
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { quantity, unitPrice, purchaseDate, ...restData } =
      updateInventoryDto;

    let totalValue: number | undefined = undefined;

    // Ambil data item saat ini HANYA jika perlu menghitung ulang totalValue
    if (quantity !== undefined || unitPrice !== undefined) {
      try {
        // Gunakan findUniqueOrThrow untuk mendapatkan item atau error jika tidak ada
        const existingItem = await prismaTenant.inventoryItem.findUniqueOrThrow(
          {
            where: { id },
            select: { quantity: true, unitPrice: true }, // Hanya ambil field yang dibutuhkan
          },
        );

        // Hitung totalValue baru
        const finalQuantity = quantity ?? existingItem.quantity;
        const finalUnitPrice = unitPrice ?? existingItem.unitPrice;
        totalValue = finalQuantity * finalUnitPrice;
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new NotFoundException(
            `Item inventaris dengan ID ${id} tidak ditemukan untuk diupdate.`,
          );
        }
        throw error; // Lempar error lain
      }
    }

    try {
      // Lakukan update
      const updatedItem: InventoryItem =
        await prismaTenant.inventoryItem.update({
          where: { id },
          data: {
            ...restData,
            // Gunakan conditional spread atau ternary untuk update
            ...(quantity !== undefined && { quantity }),
            ...(unitPrice !== undefined && { unitPrice }),
            ...(totalValue !== undefined && { totalValue }),
            ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
          },
        });
      return updatedItem;
    } catch (error: unknown) {
      // Error P2025 seharusnya sudah ditangani di atas jika quantity/unitPrice diupdate
      // Tangani lagi untuk kasus update field lain tapi ID salah
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Item inventaris dengan ID ${id} tidak ditemukan saat mencoba update.`,
        );
      }
      console.error(`Gagal mengupdate inventaris ${id}:`, error);
      throw new Error('Gagal mengupdate data inventaris.');
    }
  }

  async remove(id: string): Promise<InventoryItem> {
    // Tambahkan tipe return
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      // findUniqueOrThrow akan error jika tidak ditemukan, tidak perlu cek manual lagi
      const deletedItem: InventoryItem =
        await prismaTenant.inventoryItem.delete({
          where: { id },
        });
      return deletedItem;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Item inventaris dengan ID ${id} tidak ditemukan untuk dihapus.`,
        );
      }
      console.error(`Gagal menghapus item inventaris ${id}:`, error);
      throw new Error('Gagal menghapus data inventaris.');
    }
  }
}
