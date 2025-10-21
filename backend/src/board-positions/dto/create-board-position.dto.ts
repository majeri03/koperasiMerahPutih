import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateBoardPositionDto {
  @ApiProperty({ example: 'Ketua', description: 'Jabatan pengurus' })
  @IsString()
  @IsNotEmpty()
  jabatan: string;

  @ApiProperty({ example: '2024-01-10', description: 'Tanggal diangkat (YYYY-MM-DD)' })
  @IsDateString()
  tanggalDiangkat: string;

  @ApiProperty({ example: 'uuid-anggota-123', description: 'ID Anggota yang menjadi pengurus' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ example: 'https://example.com/fingerprint.jpg', required: false })
  @IsUrl()
  @IsOptional()
  fingerprintUrl?: string;

  @ApiProperty({ example: 'https://example.com/signature.jpg', required: false })
  @IsUrl()
  @IsOptional()
  signatureUrl?: string;
}
