// src/public/dto/register-tenant.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterTenantDto {
  @ApiProperty({ example: 'Koperasi Warga Sejahtera' })
  @IsString()
  @IsNotEmpty()
  cooperativeName: string;

  @ApiProperty({ example: 'wargasejahtera' })
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  subdomain: string;

  @ApiProperty({ example: 'Rina Pengelola' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ example: 'rina.p@example.com' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ example: 'password12345' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  adminPassword: string;
}
