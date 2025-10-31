// src/member-suggestion/dto/create-member-suggestion.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMemberSuggestionDto {
  @ApiProperty({
    example: 'Sebaiknya koperasi mengadakan pelatihan digital marketing.',
    description: 'Kolom 5: Isi Saran Anggota',
  })
  @IsString()
  @IsNotEmpty({ message: 'Isi saran tidak boleh kosong.' })
  suggestion: string;

  // Kolom 1, 2, 3, 4 (No Urut, Tanggal, Nama, Alamat)
  // akan di-handle secara otomatis oleh service menggunakan data user yang login.
  // Kolom 7, 8 (Tanggapan) akan diisi oleh Pengurus via DTO lain.
}
