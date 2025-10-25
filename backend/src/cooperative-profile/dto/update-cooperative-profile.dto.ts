// src/cooperative-profile/dto/update-cooperative-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateCooperativeProfileDto {
  @ApiProperty({
    example: 'Koperasi Maju Jaya Bersama',
    description: 'Nama tampil koperasi',
    required: false,
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  // logoUrl akan di-update oleh endpoint upload terpisah,
  // tapi kita sertakan di sini jika ingin update manual URL
  @ApiProperty({
    example: 'https://storage.example.com/logo-koperasi.png',
    description: 'URL Logo Koperasi',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    example: '081234567890',
    description: 'Nomor Telepon publik koperasi',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'info@majujaya.koperasi.id',
    description: 'Email publik koperasi',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'https://majujaya.koperasi.id',
    description: 'Website publik koperasi',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: 'Jl. Koperasi No. 1, Bandung, Jawa Barat',
    description: 'Alamat publik koperasi',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'Koperasi kami bergerak di bidang simpan pinjam...',
    description: 'Deskripsi singkat koperasi',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
