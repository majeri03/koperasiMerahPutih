// src/guest-book/dto/create-guest-book.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateGuestBookDto {
  @ApiProperty({
    example: 'Bapak Budi Santoso',
    description: 'Kolom 3: Nama Tamu',
  })
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @ApiProperty({
    example: 'Dinas Koperasi dan UKM Kota Maju',
    description: 'Kolom 4: Instansi / Alamat Tamu',
  })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({
    example: 'Ibu Rina (Sekretaris)',
    description: 'Kolom 5: Bertemu Dengan Siapa',
    required: false,
  })
  @IsString()
  @IsOptional()
  meetWith?: string;

  @ApiProperty({
    example: 'Koordinasi program pelatihan anggota',
    description: 'Kolom 6: Maksud dan Tujuan',
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    example: 'https://storage.example.com/ttd-budi.png',
    description: 'Kolom 7: URL Tanda Tangan (jika ada)',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  signatureUrl?: string;
}
