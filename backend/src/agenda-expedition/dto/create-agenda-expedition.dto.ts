// src/agenda-expedition/dto/create-agenda-expedition.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAgendaExpeditionDto {
  @ApiProperty({
    example: '123/KMP/X/2025',
    description: 'Kolom 2: Nomor Surat',
  })
  @IsString()
  @IsNotEmpty()
  letterNumber: string;

  @ApiProperty({
    example: '2025-10-24',
    description: 'Kolom 2: Tanggal Surat (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  letterDate: string; // Terima sebagai string, konversi di service

  @ApiProperty({
    example: 'Dinas Koperasi dan UKM',
    description: 'Kolom 3: Ditujukan Kepada',
  })
  @IsString()
  @IsNotEmpty()
  addressedTo: string;

  @ApiProperty({
    example: 'Permohonan Undangan Rapat Anggota Tahunan',
    description: 'Kolom 4: Perihal',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Dikirim via kurir tanggal 25/10/2025',
    description: 'Kolom 5: Keterangan (Opsional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
