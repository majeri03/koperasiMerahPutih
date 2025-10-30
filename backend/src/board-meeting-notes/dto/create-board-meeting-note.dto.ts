// backend/src/board-meeting-notes/dto/create-board-meeting-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBoardMeetingNoteDto {
  @ApiProperty({
    example: '2025-10-22',
    description: 'Hari dan Tanggal Rapat (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  meetingDate: string;

  @ApiProperty({ example: 'Ruang Rapat Utama', description: 'Tempat Rapat' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: 'Rapat Koordinasi Bulanan',
    description: 'Sifat Rapat',
  })
  @IsString()
  @IsNotEmpty()
  meetingType: string;

  @ApiProperty({ example: 5, description: 'Jumlah Total Pengurus' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  totalBoard: number;

  @ApiProperty({ example: 4, description: 'Jumlah Pengurus yang Hadir' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  boardPresent: number;

  @ApiProperty({
    example: 'Andi Wijaya (Ketua)',
    description: 'Pimpinan Rapat',
  })
  @IsString()
  @IsNotEmpty()
  leader: string;

  @ApiProperty({
    example: 'Bpk. Budi (Konsultan)',
    description: 'Undangan yang Hadir (jika ada)',
    required: false,
  })
  @IsString()
  @IsOptional()
  attendees?: string;

  @ApiProperty({
    example: '1. Pembahasan Laporan Keuangan...\n2. Keputusan: Disetujui.',
    description: 'Materi Rapat dan Keputusan Rapat',
  })
  @IsString()
  @IsNotEmpty()
  agendaAndDecision: string;
}
