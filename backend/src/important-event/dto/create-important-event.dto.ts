// src/important-event/dto/create-important-event.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateImportantEventDto {
  @ApiProperty({
    example: 'Terjadi pemadaman listrik mendadak di kantor.',
    description: 'Kolom 3: Uraian Kejadian',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Sudah diatasi dengan menyalakan genset cadangan.',
    description: 'Kolom 4: Penyelesaian (Opsional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  resolution?: string;

  @ApiProperty({
    example: 'Penyebab: Gangguan jaringan PLN. Tidak ada kerugian materil.',
    description: 'Kolom 5: Sebab-sebab Kejadian dan Keterangan Lain (Opsional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  causeAndNotes?: string;

  // Kolom 1, 2 (No Urut, Tanggal) otomatis.
  // Kolom 6 (Tanda Tangan Pengurus) akan ditambahkan otomatis oleh service.
}
