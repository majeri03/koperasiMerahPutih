// src/articles/dto/create-article.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ArticleStatus } from '@prisma/client'; // Import Enum dari Prisma Client

export class CreateArticleDto {
  @ApiProperty({
    example: 'Rapat Anggota Tahunan (RAT) 2025 Sukses Digelar',
    description: 'Judul berita atau artikel',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Ini adalah isi lengkap dari berita tentang RAT 2025...',
    description: 'Konten utama artikel (bisa HTML atau Markdown)',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'Ringkasan singkat tentang suksesnya RAT 2025.',
    description: 'Kutipan singkat atau ringkasan artikel (opsional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  // imageUrl akan di-handle oleh endpoint upload terpisah, tidak di-set saat create awal
  // @ApiProperty({ example: 'https://image.url/rat2025.jpg', description: 'URL Gambar Unggulan', required: false })
  // @IsUrl()
  // @IsOptional()
  // imageUrl?: string;

  @ApiProperty({
    example: 'https://news.example.com/rat-2025',
    description: 'Link ke sumber berita asli jika ada (opsional)',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  sourceLink?: string;

  @ApiProperty({
    enum: ArticleStatus, // Gunakan Enum
    example: ArticleStatus.DRAFT, // Default bisa DRAFT atau PUBLISHED
    description: 'Status awal artikel (DRAFT/PUBLISHED)',
    required: false, // Kita set default di service jika tidak diisi
  })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus; // Default akan DRAFT
}
