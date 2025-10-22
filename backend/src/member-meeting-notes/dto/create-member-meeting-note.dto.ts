// backend/src/member-meeting-notes/dto/create-member-meeting-note.dto.ts
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

export class CreateMemberMeetingNoteDto {
  @ApiProperty({
    example: '2025-03-15',
    description: 'Hari dan Tanggal Rapat (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  meetingDate: string;

  @ApiProperty({ example: 'Aula Kantor Koperasi', description: 'Tempat Rapat' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Rapat Anggota Tahunan', description: 'Sifat Rapat' })
  @IsString()
  @IsNotEmpty()
  meetingType: string;

  @ApiProperty({
    example: 150,
    description: 'Jumlah Anggota Koperasi saat itu',
  })
  @IsInt()
  @Min(0)
  totalMembers: number;

  @ApiProperty({ example: 120, description: 'Jumlah Anggota yang Hadir' })
  @IsInt()
  @Min(0)
  membersPresent: number;

  @ApiProperty({
    example: 'Andi Wijaya (Ketua)',
    description: 'Pimpinan Rapat',
  })
  @IsString()
  @IsNotEmpty()
  leader: string;

  @ApiProperty({
    example: 'Perwakilan Dinas Koperasi',
    description: 'Undangan yang Hadir (jika ada)',
    required: false,
  })
  @IsString()
  @IsOptional()
  attendees?: string;

  @ApiProperty({
    example: '1. Laporan Pengurus...\n2. Keputusan: Menyetujui laporan.',
    description: 'Materi Rapat dan Keputusan Rapat',
  })
  @IsString()
  @IsNotEmpty()
  agendaAndDecision: string;

  @ApiProperty({
    example: 'https://storage.example.com/notulen-rat-2025.pdf',
    description: 'URL file scan/dokumen notulen',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  documentUrl?: string;

  @ApiProperty({
    example: 'Siti Aminah (Sekretaris)',
    description: 'Nama Notulis',
    required: false,
  })
  @IsString()
  @IsOptional()
  notulis?: string;
}
