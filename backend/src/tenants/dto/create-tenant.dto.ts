import {
  IsNotEmpty,
  IsString,
  IsAlphanumeric,
  IsEmail,
  MinLength,
  IsEnum,
  IsNumberString,
  Length,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
export class CreateTenantDto {
  @ApiProperty({ example: 'Koperasi Maju Jaya' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'majujaya' })
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric() // Hanya boleh huruf dan angka, tanpa spasi/simbol
  subdomain: string; // e.g., "majujaya"

  @ApiProperty({ example: 'Budi Pengurus' })
  @IsString()
  @IsNotEmpty({ message: 'Nama admin tidak boleh kosong.' })
  adminName: string; // Nama Lengkap Admin

  @ApiProperty({ example: 'budi.p@example.com' })
  @IsEmail({}, { message: 'Format email admin tidak valid.' })
  @IsNotEmpty({ message: 'Email admin tidak boleh kosong.' })
  adminEmail: string; // Email Admin

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'Password admin tidak boleh kosong.' })
  @MinLength(8, { message: 'Password admin minimal 8 karakter.' })
  adminPassword: string; // Password Admin

  @ApiProperty({
    example: '3301234567890001',
    description: 'NIK Admin (16 digit)',
  })
  @IsNumberString({}, { message: 'NIK admin harus berupa angka.' })
  @Length(16, 16, { message: 'NIK admin harus 16 digit.' })
  @IsNotEmpty({ message: 'NIK admin tidak boleh kosong.' })
  adminNik: string; // NIK Admin

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender, { message: 'Gender admin tidak valid.' })
  @IsNotEmpty({ message: 'Gender admin tidak boleh kosong.' })
  adminGender: Gender; // Gender Admin

  @ApiProperty({ example: 'Jakarta' })
  @IsString()
  @IsNotEmpty({ message: 'Tempat lahir admin tidak boleh kosong.' })
  adminPlaceOfBirth: string; // Tempat Lahir Admin

  @ApiProperty({ example: '1985-10-20', description: 'YYYY-MM-DD' })
  @IsDateString(
    {},
    { message: 'Format tanggal lahir admin tidak valid (YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'Tanggal lahir admin tidak boleh kosong.' })
  adminDateOfBirth: string; // Tanggal Lahir Admin (string YYYY-MM-DD)

  @ApiProperty({ example: 'Ketua' })
  @IsString()
  @IsNotEmpty({ message: 'Pekerjaan admin tidak boleh kosong.' })
  adminOccupation: string; // Pekerjaan Admin

  @ApiProperty({ example: 'Jl. Koperasi No. 1, Jakarta' })
  @IsString()
  @IsNotEmpty({ message: 'Alamat admin tidak boleh kosong.' })
  adminAddress: string; // Alamat Admin
}
