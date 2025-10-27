// src/gallery/dto/create-gallery-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateGalleryItemDto {
  // File gambar dihandle terpisah di controller

  @ApiProperty({
    example: 'Kegiatan Rapat Anggota Tahunan 2025',
    description: 'Deskripsi singkat foto (opsional)',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Urutan tampil (opsional, angka lebih kecil tampil duluan)',
    required: false,
    type: 'integer',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(
    ({ value }) => {
      if (typeof value === 'string') {
        const parsed = parseInt(value.trim(), 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      if (typeof value === 'number') {
        return Number.isInteger(value) ? value : undefined;
      }
      return undefined;
    },
    { toClassOnly: true },
  )
  order?: number;
}
