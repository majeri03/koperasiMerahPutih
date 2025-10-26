// src/tenants/dto/reject-tenant.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectTenantDto {
  @ApiProperty({
    example: 'Dokumen pendaftaran tidak lengkap.',
    description: 'Alasan penolakan pendaftaran tenant',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5) // Minimal 5 karakter untuk alasan
  reason: string;
}
