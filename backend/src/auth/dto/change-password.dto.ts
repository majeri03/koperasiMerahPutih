// src/auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'PasswordLamaSaya123',
    description: 'Password saat ini yang masih valid',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    example: 'PasswordBaruSaya456',
    description: 'Password baru minimal 8 karakter',
  })
  @IsString()
  @MinLength(8, { message: 'Password baru minimal harus 8 karakter.' })
  @IsNotEmpty()
  newPassword: string;
}
