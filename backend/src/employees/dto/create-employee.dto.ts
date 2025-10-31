// backend/src/employees/dto/create-employee.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client'; // Pastikan enum Gender diimpor
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Nama Karyawan Lengkap' })
  @IsString()
  @IsNotEmpty()
  fullName: string; // Kolom 2

  @ApiProperty({ example: 'Makassar' })
  @IsString()
  @IsNotEmpty()
  placeOfBirth: string; // Kolom 3 (Tempat)

  @ApiProperty({ example: '1995-06-20', description: 'YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string; // Kolom 3 (Tanggal)

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender; // Kolom 4

  @ApiProperty({ example: 'Jl. Ahmad Yani No. 5, Makassar' })
  @IsString()
  @IsNotEmpty()
  address: string; // Kolom 5

  @ApiProperty({ example: '2025-01-10', description: 'YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  hireDate: string; // Kolom 6

  @ApiProperty({ example: 'Staf Administrasi' })
  @IsString()
  @IsNotEmpty()
  position: string; // Kolom 7

  @ApiProperty({ example: 'Bertanggung jawab untuk...', required: false })
  @IsString()
  @IsOptional()
  notes?: string; // Kolom 8
}
