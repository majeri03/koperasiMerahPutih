// src/public/dto/register-tenant.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  MinLength,
  IsOptional,
  IsDateString,
  IsUrl,
} from 'class-validator';

export class RegisterTenantDto {
  // === Informasi Koperasi ===
  @ApiProperty({ example: 'Koperasi Maju Jaya' })
  @IsString()
  @IsNotEmpty()
  cooperativeName: string;

  @ApiProperty({ example: 'majujaya' })
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  subdomain: string;

  @ApiProperty({ example: 'SK-AHU-12345', required: false })
  @IsString()
  @IsOptional()
  skAhuKoperasi?: string;

  @ApiProperty({ example: 'Jawa Barat' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ example: 'Kota Bandung' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Sukasari' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Gegerkalong' })
  @IsString()
  @IsNotEmpty()
  village: string;

  @ApiProperty({ example: 'Jl. Koperasi No. 1, Bandung' })
  @IsString()
  @IsNotEmpty()
  alamatLengkap: string;

  @ApiProperty({ example: 'https://maps.app.goo.gl/abcdef', required: false })
  @IsUrl()
  @IsOptional()
  petaLokasi?: string;

  // === Informasi PIC (Calon Admin/Member Pertama) ===
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  picFullName: string;

  @ApiProperty({ example: '3201234567890001', description: 'NIK 16 digit' })
  @IsNumberString()
  @Length(16, 16)
  picNik: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  picGender: Gender;

  @ApiProperty({ example: 'Bandung' })
  @IsString()
  @IsNotEmpty()
  picPlaceOfBirth: string;

  @ApiProperty({ example: '1985-05-10', description: 'YYYY-MM-DD' })
  @IsDateString()
  picDateOfBirth: string;

  @ApiProperty({ example: 'Ketua Pengurus' })
  @IsString()
  @IsNotEmpty()
  picOccupation: string;

  @ApiProperty({ example: 'Jl. Pribadi No. 10, Bandung' })
  @IsString()
  @IsNotEmpty()
  picAddress: string;

  @ApiProperty({ example: '081234567890' })
  @IsNumberString()
  picPhoneNumber: string;

  // === Informasi Akun ===
  @ApiProperty({ example: 'info@majujaya.koperasi.id' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'passwordyangkuat123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  // === Dokumen (URL) ===
  @ApiProperty({ example: 'https://storage.com/pengesahan.pdf' })
  @IsUrl()
  @IsOptional() // Ubah ke IsNotEmpty() jika wajib
  dokPengesahanPendirianUrl?: string;

  @ApiProperty({ example: 'https://storage.com/daftar-umum.pdf' })
  @IsUrl()
  @IsOptional()
  dokDaftarUmumUrl?: string;

  @ApiProperty({ example: 'https://storage.com/akte.pdf' })
  @IsUrl()
  @IsOptional()
  dokAkteNotarisUrl?: string;

  @ApiProperty({ example: 'https://storage.com/npwp.pdf' })
  @IsUrl()
  @IsOptional()
  dokNpwpKoperasiUrl?: string;
}
