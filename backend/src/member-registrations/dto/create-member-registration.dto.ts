// backend/src/member-registrations/dto/create-member-registration.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client'; // Pastikan path Prisma Client benar
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MinLength,
  IsAlphanumeric,
  IsDateString,
} from 'class-validator';

export class CreateMemberRegistrationDto {
  // === Data Akun ===
  @ApiProperty({
    example: 'calon.anggota@email.com',
    description: 'Email unik calon anggota',
  })
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email: string;

  @ApiProperty({
    example: 'passwordRahasia123',
    description: 'Kata sandi minimal 8 karakter',
  })
  @IsString()
  @MinLength(8, { message: 'Kata sandi minimal harus 8 karakter.' })
  password: string;

  // === Data Pribadi Lengkap ===
  @ApiProperty({ example: '3301234567891111', description: 'NIK 16 digit' })
  @IsNumberString({}, { message: 'NIK harus berupa angka.' })
  @Length(16, 16, { message: 'NIK harus terdiri dari 16 digit.' })
  nik: string;

  @ApiProperty({ example: 'Siti Lestari' })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong.' })
  fullName: string;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender, { message: 'Jenis kelamin tidak valid.' })
  @IsNotEmpty({ message: 'Jenis kelamin tidak boleh kosong.' })
  gender: Gender;

  @ApiProperty({ example: 'Cilacap' }) // <-- WAJIBKAN
  @IsString()
  @IsNotEmpty({ message: 'Tempat lahir tidak boleh kosong.' })
  placeOfBirth: string;

  @ApiProperty({ example: '1990-05-15', description: 'Format YYYY-MM-DD' }) // <-- WAJIBKAN
  @IsDateString(
    {},
    { message: 'Format tanggal lahir tidak valid (YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'Tanggal lahir tidak boleh kosong.' })
  dateOfBirth: string; // Terima sebagai string, konversi di service

  @ApiProperty({ example: 'Ibu Rumah Tangga' }) // <-- WAJIBKAN
  @IsString()
  @IsNotEmpty({ message: 'Pekerjaan tidak boleh kosong.' })
  occupation: string;

  @ApiProperty({
    example: 'Jl. Merdeka No. 12, Kel. Sidanegara, Kec. Cilacap Tengah',
  }) // <-- WAJIBKAN
  @IsString()
  @IsNotEmpty({ message: 'Alamat lengkap tidak boleh kosong.' })
  address: string;

  @ApiProperty({ example: '081234567890' })
  @IsNumberString({}, { message: 'Nomor HP harus berupa angka.' })
  @IsNotEmpty({ message: 'Nomor HP tidak boleh kosong.' })
  phoneNumber: string;

  // === Target Koperasi (Hanya jika mendaftar via domain utama) ===
  // Hapus/komentari baris ini jika pendaftaran HANYA via subdomain
  @ApiProperty({
    example: 'koperasi-sejahtera',
    description:
      'Subdomain koperasi tujuan (HANYA diisi jika mendaftar via domain utama)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsAlphanumeric()
  targetSubdomain?: string;
}
