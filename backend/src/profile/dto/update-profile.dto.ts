// src/profile/dto/update-my-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

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

  @ApiProperty({
    example: '081234567891',
    description: 'Nomor telepon pengguna (opsional)',
    required: false,
  })
  @IsNumberString({}, { message: 'Nomor telepon harus berupa string angka.' }) // Validasi angka
  @IsOptional() // Opsional saat update
  phoneNumber?: string;
}
