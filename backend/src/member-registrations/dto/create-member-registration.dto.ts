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
  // Jika butuh validasi tanggal, uncomment:
  // IsDateString,
} from 'class-validator';

export class CreateMemberRegistrationDto {
  @ApiProperty({
    example: 'koperasi-sejahtera',
    description:
      'Subdomain koperasi tujuan (HANYA diisi jika mendaftar via domain utama)',
    required: false, // Tandai sebagai opsional di Swagger
  })
  @IsOptional() // Validasi: Boleh tidak ada
  @IsString()
  @IsAlphanumeric() // Validasi: Hanya huruf & angka (sesuai aturan subdomain)
  targetSubdomain?: string;
  // --- Data Akun ---
  @ApiProperty({
    example: 'siti.lestari@email.com',
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

  // --- Data Pribadi (mirip CreateMemberDto) ---
  @ApiProperty({ example: '3301234567890001', description: 'NIK 16 digit' })
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

  @ApiProperty({ example: '081234567890' })
  @IsNumberString({}, { message: 'Nomor HP harus berupa angka.' })
  @IsNotEmpty({ message: 'Nomor HP tidak boleh kosong.' })
  phoneNumber: string;

  // --- Tambahkan field lain sesuai kebutuhan form & model ---
  // Contoh (sesuaikan dengan form frontend Anda):
  // @ApiProperty({ example: 'Cilacap' })
  // @IsString()
  // @IsNotEmpty({ message: 'Tempat lahir tidak boleh kosong.' })
  // placeOfBirth: string;

  // @ApiProperty({ example: '1990-05-15', description: 'Format YYYY-MM-DD' })
  // @IsDateString()
  // @IsNotEmpty({ message: 'Tanggal lahir tidak boleh kosong.' })
  // dateOfBirth: string;

  // @ApiProperty({ example: 'Ibu Rumah Tangga' })
  // @IsString()
  // @IsNotEmpty({ message: 'Pekerjaan tidak boleh kosong.' })
  // occupation: string;

  // @ApiProperty({ example: 'Jl. Merdeka No. 12...' })
  // @IsString()
  // @IsNotEmpty({ message: 'Alamat tidak boleh kosong.' })
  // address: string;

  // Jika ada file upload (opsional)
  // @ApiProperty({ example: 'https://storage.com/ktp.jpg', required: false })
  // @IsOptional()
  // @IsUrl()
  // ktpScanUrl?: string;

  // @ApiProperty({ example: 'https://storage.com/foto.jpg', required: false })
  // @IsOptional()
  // @IsUrl()
  // photoUrl?: string;
}
