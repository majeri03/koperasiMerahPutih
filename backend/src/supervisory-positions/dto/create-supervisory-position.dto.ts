import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

export class CreateSupervisoryPositionDto {
  @ApiProperty({ example: 'Ketua Pengawas', description: 'Jabatan pengawas' })
  @IsString()
  @IsNotEmpty()
  jabatan: string;

  @ApiProperty({
    example: '2024-01-10',
    description: 'Tanggal diangkat (YYYY-MM-DD)',
  })
  @IsDateString()
  tanggalDiangkat: string;

  @ApiProperty({
    example: 'uuid-anggota-456',
    description: 'ID Anggota yang menjadi pengawas',
  })
  @IsUUID()
  memberId: string;

  @ApiProperty({
    example: 'https://example.com/fingerprint-awas.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  fingerprintUrl?: string;

  @ApiProperty({
    example: 'https://example.com/signature-awas.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  signatureUrl?: string;
}
