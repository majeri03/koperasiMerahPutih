// backend/src/supervisory-meeting-notes/dto/create-supervisory-meeting-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateSupervisoryMeetingNoteDto {
  @ApiProperty({
    example: '2025-10-23',
    description: 'Hari dan Tanggal Rapat (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  meetingDate: string; // Kolom 1

  @ApiProperty({ example: 'Ruang Pengawas', description: 'Tempat Rapat' })
  @IsString()
  @IsNotEmpty()
  location: string; // Kolom 2

  @ApiProperty({
    example: 'Rapat Pemeriksaan Bulanan',
    description: 'Sifat Rapat',
  })
  @IsString()
  @IsNotEmpty()
  meetingType: string; // Kolom 3

  @ApiProperty({ example: 3, description: 'Jumlah Total Pengawas' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  totalSupervisory: number; // Kolom 4

  @ApiProperty({ example: 3, description: 'Jumlah Pengawas yang Hadir' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  supervisoryPresent: number; // Kolom 5

  @ApiProperty({
    example: 'Rahmat Hidayat (Ketua Pengawas)',
    description: 'Pimpinan Rapat',
  })
  @IsString()
  @IsNotEmpty()
  leader: string; // Kolom 6

  @ApiProperty({
    example: 'Siti Aminah (Sekretaris Pengurus)',
    description: 'Undangan yang Hadir (jika ada)',
    required: false,
  })
  @IsString()
  @IsOptional()
  attendees?: string; // Kolom 7

  @ApiProperty({
    example:
      '1. Verifikasi Kas...\n2. Temuan: Selisih Rp 5.000.\n3. Keputusan: Investigasi lebih lanjut.',
    description: 'Materi Rapat dan Keputusan Rapat',
  })
  @IsString()
  @IsNotEmpty()
  agendaAndDecision: string; // Kolom 8

  @ApiProperty({
    example: 'https://example.com/scan-notulen-pengawas.pdf',
    description: 'URL dokumen/scan notulen (jika ada)',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  documentUrl?: string; // Kolom 9 (Opsional)
}
