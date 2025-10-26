// src/articles/articles.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject, // <-- Diperlukan untuk Request Scope
  Scope, // <-- Diperlukan untuk Request Scope
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Article, ArticleStatus, Prisma, PrismaClient } from '@prisma/client';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import slugify from 'slugify';
import { UploadsService } from 'src/uploads/uploads.service'; // <-- Import UploadsService
import { REQUEST } from '@nestjs/core'; // <-- Import REQUEST
import type { Request } from 'express'; // <-- Import Request type

// Interface untuk hasil pagination
export interface PaginatedArticlesResult {
  data: Partial<Article>[]; // Bisa Partial<Article> jika hanya field tertentu
  meta: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({ scope: Scope.REQUEST }) // <-- Jadikan Request Scoped untuk tenantId
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService, // <-- Inject UploadsService
    @Inject(REQUEST) private request: Request, // <-- Inject Request
  ) {}

  /**
   * (Pengurus) Membuat artikel baru.
   */
  async create(
    createDto: CreateArticleDto,
    user: JwtPayloadDto,
  ): Promise<Article> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { title, status, ...restData } = createDto;

    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

    let attempts = 0;
    while (attempts < 5) {
      const existing = await prismaTenant.article.findUnique({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 100000)}`;
      attempts++;
    }
    if (attempts === 5) {
      throw new InternalServerErrorException(
        'Gagal membuat slug unik untuk artikel.',
      );
    }

    const initialStatus = status ?? ArticleStatus.DRAFT;

    const dataToCreate: Prisma.ArticleCreateInput = {
      ...restData,
      title,
      slug,
      status: initialStatus,
      author: { connect: { id: user.userId } }, // Hubungkan ke author via ID
    };

    try {
      const newArticle = await prismaTenant.article.create({
        data: dataToCreate,
        include: {
          author: { select: { fullName: true } },
        },
      });
      return newArticle;
    } catch (error) {
      console.error('Gagal membuat artikel:', error);
      throw new InternalServerErrorException('Gagal menyimpan artikel baru.');
    }
  }

  /**
   * (Publik/Anggota/Pengurus) Mendapatkan daftar artikel PUBLISHED (Pagination).
   */
  async findAllPublished(
    page = 1,
    limit = 10,
  ): Promise<PaginatedArticlesResult> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (pageNum - 1) * limitNum;

    try {
      const articles = await prismaTenant.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        skip: skip,
        take: limitNum,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          publishedAt: true,
          createdAt: true,
          author: { select: { fullName: true } },
        },
      });
      const totalArticles = await prismaTenant.article.count({
        where: { status: ArticleStatus.PUBLISHED },
      });
      return {
        data: articles,
        meta: {
          currentPage: pageNum,
          perPage: limitNum,
          totalItems: totalArticles,
          totalPages: Math.ceil(totalArticles / limitNum),
        },
      };
    } catch (error) {
      console.error('Gagal mengambil artikel publish:', error);
      throw new InternalServerErrorException('Gagal mengambil daftar artikel.');
    }
  }

  /**
   * (Hanya Pengurus) Mendapatkan daftar SEMUA artikel (Pagination + Filter).
   */
  async findAll(
    page = 1,
    limit = 10,
    status?: ArticleStatus,
  ): Promise<PaginatedArticlesResult> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: Prisma.ArticleWhereInput = {};
    if (status && Object.values(ArticleStatus).includes(status)) {
      whereClause.status = status;
    } else if (status) {
      console.warn(`Status filter tidak valid diterima: ${status}`);
    }

    try {
      const articles = await prismaTenant.article.findMany({
        where: whereClause,
        skip: skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { fullName: true } } }, // Include full data for admin
      });
      const totalArticles = await prismaTenant.article.count({
        where: whereClause,
      });
      return {
        data: articles,
        meta: {
          currentPage: pageNum,
          perPage: limitNum,
          totalItems: totalArticles,
          totalPages: Math.ceil(totalArticles / limitNum),
        },
      };
    } catch (error) {
      console.error('Gagal mengambil semua artikel (admin):', error);
      throw new InternalServerErrorException('Gagal mengambil daftar artikel.');
    }
  }

  /**
   * (Publik/Anggota/Pengurus) Mendapatkan detail artikel PUBLISHED by slug.
   */
  async findOneBySlug(slug: string): Promise<Article> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const article = await prismaTenant.article.findUnique({
        where: { slug: slug, status: ArticleStatus.PUBLISHED },
        include: { author: { select: { fullName: true } } },
      });
      if (!article) {
        throw new NotFoundException(
          `Artikel slug "${slug}" tidak ditemukan/publish.`,
        );
      }
      return article;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(`Gagal mencari artikel slug ${slug}:`, error);
      throw new InternalServerErrorException('Gagal mengambil data artikel.');
    }
  }

  /**
   * (Hanya Pengurus) Mendapatkan detail artikel by ID (termasuk DRAFT).
   */
  async findOneById(id: string): Promise<Article> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const article = await prismaTenant.article.findUnique({
        where: { id: id },
        include: { author: { select: { fullName: true } } },
      });
      if (!article) {
        throw new NotFoundException(`Artikel ID "${id}" tidak ditemukan.`);
      }
      return article;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(`Gagal mencari artikel ID ${id}:`, error);
      throw new InternalServerErrorException('Gagal mengambil data artikel.');
    }
  }

  /**
   * (Hanya Pengurus) Memperbarui artikel.
   */
  async update(
    id: string,
    updateDto: UpdateArticleDto,
    user: JwtPayloadDto,
  ): Promise<Article> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const { title, status, ...restData } = updateDto;

    const currentArticle = await this.findOneById(id);

    const dataToUpdate: Prisma.ArticleUpdateInput = { ...restData };

    if (title && title !== currentArticle.title) {
      dataToUpdate.title = title;
      const baseSlug = slugify(title, { lower: true, strict: true });
      let newSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
      let attempts = 0;
      while (attempts < 5) {
        const existing = await prismaTenant.article.findFirst({
          where: { slug: newSlug, id: { not: id } },
        });
        if (!existing) break;
        newSlug = `${baseSlug}-${Math.floor(Math.random() * 100000)}`;
        attempts++;
      }
      if (attempts === 5) {
        throw new InternalServerErrorException('Gagal membuat slug unik baru.');
      }
      dataToUpdate.slug = newSlug;
    }

    if (status && status !== currentArticle.status) {
      dataToUpdate.status = status;
      if (
        status === ArticleStatus.PUBLISHED &&
        currentArticle.status !== ArticleStatus.PUBLISHED &&
        !currentArticle.publishedAt
      ) {
        dataToUpdate.publishedAt = new Date();
      }
    }

    // Optional: update authorId on edit?
    dataToUpdate.author = { connect: { id: user.userId } };

    try {
      const updatedArticle = await prismaTenant.article.update({
        where: { id: id },
        data: dataToUpdate,
        include: { author: { select: { fullName: true } } },
      });
      return updatedArticle;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' &&
          error.meta?.target === 'articles_slug_key'
        ) {
          throw new BadRequestException(
            'Judul artikel menghasilkan slug yang sudah digunakan.',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Artikel ID "${id}" tidak ditemukan saat update.`,
          );
        }
      }
      console.error(`Gagal mengupdate artikel ${id}:`, error);
      throw new InternalServerErrorException('Gagal memperbarui artikel.');
    }
  }

  /**
   * (Hanya Pengurus) Menghapus artikel.
   */
  async remove(id: string): Promise<void> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // 1. Ambil data artikel (termasuk imageUrl) SEBELUM dihapus
    const articleToDelete = await this.findOneById(id); // Reuse logic findOneById
    const imageUrlToDelete = articleToDelete.imageUrl; // Simpan URL gambar

    // 2. Hapus file dari R2 JIKA URL ada
    if (imageUrlToDelete) {
      try {
        // Panggil service upload untuk menghapus file
        await this.uploadsService.deleteFile(imageUrlToDelete);
        // Logging sukses sudah ada di dalam deleteFile
      } catch (fileDeleteError) {
        // Log error penghapusan file tapi JANGAN hentikan proses
        // karena lebih penting menghapus record DB daripada file orphan
        console.error(
          `[ArticlesService] Gagal menghapus file gambar ${imageUrlToDelete} untuk artikel ${id}. Melanjutkan hapus record DB:`,
          fileDeleteError,
        );
      }
    } else {
      console.log(
        `[ArticlesService] Tidak ada gambar untuk dihapus pada artikel ${id}.`,
      );
    }

    // 3. Hapus record artikel dari database (setelah mencoba hapus file)
    try {
      await prismaTenant.article.delete({ where: { id: id } });
    } catch (error) {
      // Error NotFound sudah ditangani oleh findOneById di awal
      // Tangani error P2025 jika record hilang antara find dan delete
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Artikel ID "${id}" tidak ditemukan saat mencoba menghapus.`,
        );
      }
      console.error(`Gagal menghapus artikel ${id} dari DB:`, error);
      throw new InternalServerErrorException(
        'Gagal menghapus artikel dari database.',
      );
    }
  }

  /**
   * (Hanya Pengurus) Mengunggah/memperbarui gambar unggulan artikel.
   */
  async updateFeaturedImage(
    id: string,
    file: Express.Multer.File,
  ): Promise<Article> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    const tenantId = this.request.tenantId;

    if (!tenantId) {
      throw new InternalServerErrorException(
        'Tenant ID tidak ditemukan untuk upload gambar artikel.',
      );
    }

    // Pastikan artikel ada
    await this.findOneById(id);

    // Tentukan folder path
    const folderPath = `tenants/${tenantId}/articles/${id}`; // Simpan per artikel ID

    try {
      // 1. Upload file baru
      const { url } = await this.uploadsService.uploadFile(file, folderPath);

      // 2. Update URL di database
      const updatedArticle = await prismaTenant.article.update({
        where: { id: id },
        data: { imageUrl: url },
        include: { author: { select: { fullName: true } } },
      });

      // (Opsional) Hapus gambar lama jika ada (perlu logika tambahan di UploadsService)

      return updatedArticle;
    } catch (error) {
      console.error(`Gagal upload gambar artikel ${id}:`, error);
      if (error instanceof NotFoundException) throw error; // Dari findOneById
      throw new InternalServerErrorException(
        'Gagal mengunggah gambar unggulan.',
      );
    }
  }
}
