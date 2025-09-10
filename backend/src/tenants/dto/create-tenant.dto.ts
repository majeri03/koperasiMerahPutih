import {
  IsNotEmpty,
  IsString,
  IsAlphanumeric,
  IsEmail,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsNotEmpty()
  adminName: string;
  @ApiProperty({ example: 'budi.p@example.com' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;
  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  adminPassword: string;
}
