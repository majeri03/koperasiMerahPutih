// src/product-categories/product-categories.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient, ProductCategory } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ProductCategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * (Pengurus) Membuat kategori produk baru.
   */
  async create(createDto: CreateProductCategoryDto): Promise<ProductCategory> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { name } = createDto;

    // Generate slug
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let attempts = 0;

    // Cek keunikan slug (dan nama secara implisit karena slug dibuat dari nama unik)
    while (attempts < 5) {
      const existing = await prismaTenant.productCategory.findFirst({
        where: { OR: [{ name: name }, { slug: slug }] }, // Cek nama atau slug
      });
      if (!existing) break;
      // Jika nama sudah ada, langsung lempar conflict
      if (existing.name === name) {
        throw new ConflictException(
          `Kategori dengan nama "${name}" sudah ada.`,
        );
      }
      // Jika slug sudah ada (karena nama berbeda tapi slug sama setelah slugify), regenerate slug
      slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
      attempts++;
    }
    if (attempts === 5) {
      throw new InternalServerErrorException(
        'Gagal membuat slug unik untuk kategori.',
      );
    }

    try {
      const newCategory = await prismaTenant.productCategory.create({
        data: { name, slug },
      });
      return newCategory;
    } catch (error: any) {
      // Handle error spesifik Prisma P2002 (Unique constraint failed)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Cek field mana yang menyebabkan error
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('name')) {
          throw new ConflictException(
            `Kategori dengan nama "${name}" sudah ada.`,
          );
        }
        if (target.includes('slug')) {
          throw new ConflictException(
            `Slug "${slug}" yang dihasilkan sudah digunakan.`,
          );
        }
      }
      console.error('Gagal membuat kategori produk:', error);
      throw new InternalServerErrorException('Gagal menyimpan kategori baru.');
    }
  }

  /**
   * (Publik/Anggota/Pengurus) Mendapatkan semua kategori produk.
   */
  async findAll(): Promise<ProductCategory[]> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      return await prismaTenant.productCategory.findMany({
        orderBy: { name: 'asc' }, // Urutkan berdasarkan nama
      });
    } catch (error) {
      console.error('Gagal mengambil kategori produk:', error);
      throw new InternalServerErrorException(
        'Gagal mengambil daftar kategori.',
      );
    }
  }

  /**
   * (Pengurus) Mendapatkan detail satu kategori berdasarkan ID.
   */
  async findOne(id: string): Promise<ProductCategory> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const category = await prismaTenant.productCategory.findUnique({
        where: { id },
      });
      if (!category) {
        throw new NotFoundException(
          `Kategori dengan ID "${id}" tidak ditemukan.`,
        );
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(`Gagal mencari kategori ID ${id}:`, error);
      throw new InternalServerErrorException('Gagal mengambil data kategori.');
    }
  }

  /**
   * (Pengurus) Memperbarui nama kategori produk.
   */
  async update(
    id: string,
    updateDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { name } = updateDto;

    // Pastikan kategori ada
    await this.findOne(id); // Akan throw NotFound jika tidak ada

    // Jika nama tidak diubah, tidak perlu update apa-apa
    if (!name) {
      return this.findOne(id); // Kembalikan data yang ada
    }

    // Jika nama diubah, generate slug baru dan cek keunikan
    const baseSlug = slugify(name, { lower: true, strict: true });
    let newSlug = baseSlug;
    let attempts = 0;

    while (attempts < 5) {
      const existing = await prismaTenant.productCategory.findFirst({
        where: {
          OR: [{ name: name }, { slug: newSlug }],
          id: { not: id }, // Kecualikan kategori saat ini
        },
      });
      if (!existing) break;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (existing.name === name) {
        throw new ConflictException(
          `Nama kategori "${name}" sudah digunakan oleh kategori lain.`,
        );
      }
      newSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
      attempts++;
    }
    if (attempts === 5) {
      throw new InternalServerErrorException(
        'Gagal membuat slug unik baru untuk kategori.',
      );
    }

    try {
      const updatedCategory = await prismaTenant.productCategory.update({
        where: { id },
        data: { name, slug: newSlug },
      });
      return updatedCategory;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('name')) {
            throw new ConflictException(
              `Nama kategori "${name}" sudah digunakan oleh kategori lain.`,
            );
          }
          if (target.includes('slug')) {
            throw new ConflictException(
              `Slug "${newSlug}" yang dihasilkan sudah digunakan.`,
            );
          }
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Kategori ID "${id}" tidak ditemukan saat update.`,
          );
        }
      }
      console.error(`Gagal mengupdate kategori ${id}:`, error);
      throw new InternalServerErrorException('Gagal memperbarui kategori.');
    }
  }

  /**
   * (Pengurus) Menghapus kategori produk.
   * Tambahkan validasi: jangan hapus jika masih ada produk terkait.
   */
  async remove(id: string): Promise<void> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // Pastikan kategori ada
    await this.findOne(id);

    // Cek apakah ada produk yang masih menggunakan kategori ini
    const relatedProductsCount = await prismaTenant.product.count({
      where: { categoryId: id },
    });

    if (relatedProductsCount > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus kategori ini karena masih digunakan oleh ${relatedProductsCount} produk.`,
      );
    }

    try {
      await prismaTenant.productCategory.delete({
        where: { id },
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Kategori ID "${id}" tidak ditemukan saat menghapus.`,
        );
      }
      console.error(`Gagal menghapus kategori ${id}:`, error);
      throw new InternalServerErrorException('Gagal menghapus kategori.');
    }
  }
}
