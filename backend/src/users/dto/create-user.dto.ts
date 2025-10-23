// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'uuid-anggota-yang-didaftar-manual-123',
    description: 'ID dari Anggota (tabel Member) yang akan dibuatkan akun',
  })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({
    example: 'anggota.baru@koperasi.com',
    description: 'Email login yang unik untuk akun baru',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'PasswordKuat123',
    description: 'Password login minimal 8 karakter',
  })
  @IsString()
  @MinLength(8, { message: 'Password minimal harus 8 karakter.' })
  @IsNotEmpty()
  password: string;
}
