// src/products/products.service.ts
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient, Product } from '@prisma/client';
import slugify from 'slugify';
import { UploadsService } from 'src/uploads/uploads.service';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

// Interface untuk hasil pagination
export interface PaginatedProductsResult {
  data: Partial<Product>[]; // Gunakan Partial<Product> atau buat DTO response khusus
  meta: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({ scope: Scope.REQUEST }) // Scope Request untuk tenantId
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
    @Inject(REQUEST) private request: Request,
  ) {}

  /**
   * (Pengurus) Membuat produk baru.
   */
  async create(createDto: CreateProductDto): Promise<Product> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { name, categoryId, sku, ...restData } = createDto;

    // Validasi Kategori
    const categoryExists = await prismaTenant.productCategory.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      throw new BadRequestException(
        `Kategori produk dengan ID "${categoryId}" tidak ditemukan.`,
      );
    }

    // Generate Slug
    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prismaTenant.product.findUnique({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 100000)}`;
      attempts++;
    }
    if (attempts === 5) {
      throw new InternalServerErrorException(
        'Gagal membuat slug unik untuk produk.',
      );
    }

    // Siapkan data, termasuk default isAvailable
    const dataToCreate: Prisma.ProductCreateInput = {
      ...restData, // description, price, unit
      name,
      slug,
      sku: sku || null, // Set null jika SKU kosong/undefined
      isAvailable: restData.isAvailable ?? true, // Default true jika tidak ada di DTO
      category: { connect: { id: categoryId } },
    };

    try {
      const newProduct = await prismaTenant.product.create({
        data: dataToCreate,
        include: { category: { select: { name: true, slug: true } } }, // Include info kategori
      });
      return newProduct;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('slug'))
            throw new ConflictException(`Slug produk "${slug}" sudah ada.`);
          if (target.includes('sku') && sku)
            throw new ConflictException(`SKU "${sku}" sudah digunakan.`);
        }
      }
      console.error('Gagal membuat produk:', error);
      throw new InternalServerErrorException('Gagal menyimpan produk baru.');
    }
  }

  /**
   * (Publik) Mendapatkan daftar produk AVAILABLE (Pagination + Filter Kategori).
   */
  async findAllAvailable(
    page = 1,
    limit = 10,
    categorySlug?: string,
  ): Promise<PaginatedProductsResult> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: Prisma.ProductWhereInput = { isAvailable: true };
    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    try {
      const products = await prismaTenant.product.findMany({
        where: whereClause,
        skip: skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }, // Atau 'name', 'price', etc.
        select: {
          // Pilih field untuk publik
          id: true,
          name: true,
          slug: true,
          price: true,
          unit: true,
          imageUrl: true,
          category: { select: { name: true, slug: true } },
        },
      });
      const totalProducts = await prismaTenant.product.count({
        where: whereClause,
      });
      return {
        data: products,
        meta: {
          currentPage: pageNum,
          perPage: limitNum,
          totalItems: totalProducts,
          totalPages: Math.ceil(totalProducts / limitNum),
        },
      };
    } catch (error) {
      console.error('Gagal mengambil produk tersedia:', error);
      throw new InternalServerErrorException('Gagal mengambil daftar produk.');
    }
  }

  /**
   * (Pengurus) Mendapatkan daftar SEMUA produk (Pagination + Filter Kategori/Status).
   */
  async findAll(
    page = 1,
    limit = 10,
    categorySlug?: string,
    isAvailable?: boolean,
  ): Promise<PaginatedProductsResult> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: Prisma.ProductWhereInput = {};
    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }
    if (isAvailable !== undefined) {
      // Cek boolean
      whereClause.isAvailable = isAvailable;
    }

    try {
      const products = await prismaTenant.product.findMany({
        where: whereClause,
        skip: skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true, slug: true } } }, // Include kategori
      });
      const totalProducts = await prismaTenant.product.count({
        where: whereClause,
      });
      return {
        data: products,
        meta: {
          currentPage: pageNum,
          perPage: limitNum,
          totalItems: totalProducts,
          totalPages: Math.ceil(totalProducts / limitNum),
        },
      };
    } catch (error) {
      console.error('Gagal mengambil semua produk (admin):', error);
      throw new InternalServerErrorException('Gagal mengambil daftar produk.');
    }
  }

  /**
   * (Publik) Mendapatkan detail produk AVAILABLE by slug.
   */
  async findOneBySlug(slug: string): Promise<Product> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const product = await prismaTenant.product.findUnique({
        where: { slug: slug, isAvailable: true }, // Hanya yang available
        include: { category: { select: { name: true, slug: true } } },
      });
      if (!product) {
        throw new NotFoundException(
          `Produk slug "${slug}" tidak ditemukan/tersedia.`,
        );
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(`Gagal mencari produk slug ${slug}:`, error);
      throw new InternalServerErrorException('Gagal mengambil data produk.');
    }
  }

  /**
   * (Pengurus) Mendapatkan detail produk by ID (termasuk non-available).
   */
  async findOneById(id: string): Promise<Product> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const product = await prismaTenant.product.findUnique({
        where: { id: id },
        include: { category: { select: { name: true, slug: true } } },
      });
      if (!product) {
        throw new NotFoundException(`Produk ID "${id}" tidak ditemukan.`);
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(`Gagal mencari produk ID ${id}:`, error);
      throw new InternalServerErrorException('Gagal mengambil data produk.');
    }
  }

  /**
   * (Pengurus) Memperbarui produk.
   */
  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { name, categoryId, sku, ...restData } = updateDto;

    // Pastikan produk ada
    const currentProduct = await this.findOneById(id);

    const dataToUpdate: Prisma.ProductUpdateInput = { ...restData };

    // Handle perubahan Kategori
    if (categoryId && categoryId !== currentProduct.categoryId) {
      const categoryExists = await prismaTenant.productCategory.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists)
        throw new BadRequestException(
          `Kategori produk ID "${categoryId}" tidak ditemukan.`,
        );
      dataToUpdate.category = { connect: { id: categoryId } };
    }

    // Handle perubahan Nama -> Slug
    if (name && name !== currentProduct.name) {
      dataToUpdate.name = name;
      const baseSlug = slugify(name, { lower: true, strict: true });
      let newSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
      let attempts = 0;
      while (attempts < 5) {
        const existing = await prismaTenant.product.findFirst({
          where: { slug: newSlug, id: { not: id } },
        });
        if (!existing) break;
        newSlug = `${baseSlug}-${Math.floor(Math.random() * 100000)}`;
        attempts++;
      }
      if (attempts === 5)
        throw new InternalServerErrorException(
          'Gagal generate slug unik baru.',
        );
      dataToUpdate.slug = newSlug;
    }

    // Handle perubahan SKU (cek keunikan jika diubah)
    if (sku !== undefined && sku !== currentProduct.sku) {
      dataToUpdate.sku = sku || null; // Set null jika dikirim string kosong
      if (sku) {
        // Hanya cek unik jika SKU tidak kosong
        const existingSku = await prismaTenant.product.findFirst({
          where: { sku: sku, id: { not: id } },
        });
        if (existingSku)
          throw new ConflictException(
            `SKU "${sku}" sudah digunakan produk lain.`,
          );
      }
    }

    try {
      const updatedProduct = await prismaTenant.product.update({
        where: { id: id },
        data: dataToUpdate,
        include: { category: { select: { name: true, slug: true } } },
      });
      return updatedProduct;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('slug'))
            throw new ConflictException('Slug produk sudah digunakan.');
          if (target.includes('sku') && sku)
            throw new ConflictException(`SKU "${sku}" sudah digunakan.`);
        }
        if (error.code === 'P2025')
          throw new NotFoundException(
            `Produk ID "${id}" tidak ditemukan saat update.`,
          );
      }
      console.error(`Gagal mengupdate produk ${id}:`, error);
      throw new InternalServerErrorException('Gagal memperbarui produk.');
    }
  }

  /**
   * (Pengurus) Menghapus produk DAN gambar terkaitnya.
   */
  async remove(id: string): Promise<void> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    const productToDelete = await this.findOneById(id);
    const imageUrlToDelete = productToDelete.imageUrl;

    if (imageUrlToDelete) {
      try {
        await this.uploadsService.deleteFile(imageUrlToDelete);
      } catch (fileDeleteError) {
        console.error(
          `Gagal hapus gambar ${imageUrlToDelete} produk ${id}:`,
          fileDeleteError,
        );
        // Tetap lanjutkan hapus record DB
      }
    }

    try {
      await prismaTenant.product.delete({ where: { id: id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Produk ID "${id}" tidak ditemukan saat hapus.`,
        );
      }
      console.error(`Gagal menghapus produk ${id} dari DB:`, error);
      throw new InternalServerErrorException('Gagal menghapus produk.');
    }
  }

  /**
   * (Pengurus) Mengunggah/memperbarui gambar produk.
   */
  async updateImage(id: string, file: Express.Multer.File): Promise<Product> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const tenantId = this.request.tenantId;
    if (!tenantId)
      throw new InternalServerErrorException('Tenant ID tidak ditemukan.');

    // Pastikan produk ada & ambil URL gambar lama
    const currentProduct = await this.findOneById(id);
    const oldImageUrl = currentProduct.imageUrl;

    const folderPath = `tenants/${tenantId}/products/${id}`;

    try {
      const { url } = await this.uploadsService.uploadFile(file, folderPath);

      const updatedProduct = await prismaTenant.product.update({
        where: { id: id },
        data: { imageUrl: url },
        include: { category: { select: { name: true, slug: true } } },
      });

      // Hapus gambar lama SETELAH upload & update DB sukses
      if (oldImageUrl && oldImageUrl !== url) {
        await this.uploadsService.deleteFile(oldImageUrl).catch((err) => {
          console.error(
            `Gagal hapus gambar lama ${oldImageUrl} produk ${id}:`,
            err,
          );
          // Jangan gagalkan proses utama jika hapus file lama gagal
        });
      }

      return updatedProduct;
    } catch (error) {
      console.error(`Gagal upload gambar produk ${id}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Gagal mengunggah gambar produk.');
    }
  }
}
