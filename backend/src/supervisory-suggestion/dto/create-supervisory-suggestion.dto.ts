// src/supervisory-suggestion/dto/create-supervisory-suggestion.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateSupervisorySuggestionDto {
  @ApiProperty({
    example: 'uuid-anggota-pengawas-456',
    description:
      'Kolom 3: ID Anggota (Member) dari Pengawas yang memberi saran',
  })
  @IsUUID()
  @IsNotEmpty()
  supervisorMemberId: string;

  @ApiProperty({
    example: 'Perlu dilakukan audit mendadak pada kas bendahara.',
    description: 'Kolom 4: Isi Saran / Catatan / Pertanyaan',
  })
  @IsString()
  @IsNotEmpty()
  suggestion: string;

  @ApiProperty({
    example: 'https://storage.example.com/ttd-pengawas-01.png',
    description: 'Kolom 5: URL Tanda Tangan Pengawas (Opsional)',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  supervisorSignatureUrl?: string;

  // Kolom 1 (No Urut) dan 2 (Tanggal) akan di-handle database.
  // Kolom 6 & 7 (Tanggapan) akan diisi via DTO lain.
}
