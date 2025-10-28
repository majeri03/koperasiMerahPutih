// src/admin/platform-settings/dto/update-platform-setting.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdatePlatformSettingDto {
  @ApiProperty({
    example: 'hero_title',
    description: 'Kunci unik pengaturan (misal: hero_title, contact_email)',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 'Platform Koperasi Terbaik',
    description:
      'Nilai baru untuk pengaturan (bisa string kosong atau null untuk menghapus)',
    required: false, // Value bisa null/kosong
  })
  @IsString()
  @IsOptional() // Boleh null atau string kosong
  value: string | null;
}
