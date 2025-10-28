// src/admin/platform-settings/dto/upload-platform-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadPlatformImageDto {
  @ApiProperty({
    example: 'hero_image_url',
    description:
      'Kunci pengaturan tempat menyimpan URL gambar (misal: hero_image_url, logo_url)',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  // File akan diambil dari @UploadedFile, tidak perlu didefinisikan di sini
}
