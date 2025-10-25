// src/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token reset password yang diterima dari email',
    example: 'a1b2c3d4e5f6...', // Token unik
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Password baru pengguna (minimal 8 karakter)',
    example: 'PasswordBaruSaya123',
  })
  @IsString()
  @MinLength(8, { message: 'Password baru minimal harus 8 karakter.' })
  @IsNotEmpty()
  newPassword: string;
}
