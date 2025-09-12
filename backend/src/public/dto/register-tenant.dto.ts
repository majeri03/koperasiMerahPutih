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
} from 'class-validator';

export class RegisterTenantDto {
  // === Informasi Pribadi PIC ===
  @ApiProperty({
    example: '3501234567890001',
    description: 'Nomor Induk Kependudukan (16 digit)',
  })
  @IsNumberString()
  @Length(16, 16)
  nik: string;

  @ApiProperty({ example: 'Rina Pengelola' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'rina.p@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '81234567890' })
  @IsNumberString()
  phoneNumber: string;

  @ApiProperty({
    example: 'passwordyangkuat123',
    description: 'Minimal 8 karakter',
  })
  @IsString()
  @MinLength(8)
  password: string;

  // === Informasi Koperasi ===
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

  @ApiProperty({ example: 'Warga Sejahtera' })
  @IsString()
  @IsNotEmpty()
  cooperativeName: string;

  @ApiProperty({ example: 'wargasejahtera' })
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  subdomain: string;
}
