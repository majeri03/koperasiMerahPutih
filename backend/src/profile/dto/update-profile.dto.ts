// src/profile/dto/update-my-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO ini HANYA berisi field yang boleh diubah sendiri oleh pengguna.
 * Field krusial seperti NIK, TTL, Gender, dan Email tidak disertakan
 * karena perubahannya memerlukan validasi admin atau alur khusus.
 */
export class UpdateMyProfileDto {
  @ApiProperty({
    example: 'Budi Santoso (Update)',
    description: 'Nama lengkap baru pengguna',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: 'Wirausaha',
    description: 'Pekerjaan saat ini',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  occupation?: string;

  @ApiProperty({
    example: 'Jl. Koperasi No. 10, Bandung',
    description: 'Alamat tempat tinggal saat ini',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address?: string;

  // Kita bisa tambahkan No. HP di sini jika kolomnya ada di tabel Members.
  // Berdasarkan DTO pendaftaran,
  // No. HP (phoneNumber) ada. Namun, di CreateMemberDto tidak ada.
  // Asumsi: Kita harus menambahkan `phoneNumber` ke tabel Members nanti.
  // Untuk saat ini, kita biarkan 3 field ini dulu.
}
