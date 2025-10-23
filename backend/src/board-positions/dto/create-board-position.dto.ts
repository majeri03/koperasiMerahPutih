import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { JabatanPengurus } from 'src/auth/enums/jabatan-pengurus.enum';
export class CreateBoardPositionDto {
  @ApiProperty({
    example: JabatanPengurus.Ketua,
    description: 'Jabatan pengurus',
    enum: JabatanPengurus,
  })
  @IsEnum(JabatanPengurus)
  @IsNotEmpty()
  jabatan: JabatanPengurus;

  @ApiProperty({
    example: '2024-01-10',
    description: 'Tanggal diangkat (YYYY-MM-DD)',
  })
  @IsDateString()
  tanggalDiangkat: string;

  @ApiProperty({
    example: 'uuid-anggota-123',
    description: 'ID Anggota yang menjadi pengurus',
  })
  @IsUUID()
  memberId: string;

  @ApiProperty({
    example: 'https://example.com/fingerprint.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  fingerprintUrl?: string;

  @ApiProperty({
    example: 'https://example.com/signature.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  signatureUrl?: string;
}
