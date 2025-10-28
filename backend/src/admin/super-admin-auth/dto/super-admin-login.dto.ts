// src/admin/super-admin-auth/dto/super-admin-login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SuperAdminLoginDto {
  @ApiProperty({ example: 'superadmin@platform.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'supersecretpassword' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
