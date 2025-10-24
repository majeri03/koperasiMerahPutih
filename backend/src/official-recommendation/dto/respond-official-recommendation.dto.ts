// src/official-recommendation/dto/respond-official-recommendation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RespondOfficialRecommendationDto {
  @ApiProperty({
    example: 'Siap, sedang dalam proses pelengkapan administrasi.',
    description: 'Kolom 7: Tanggapan Pengurus',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tanggapan tidak boleh kosong.' })
  response: string;

  // Kolom 8 (Tanda Tangan Pengurus) akan diambil otomatis dari user
  // yang login (yang menanggapi) saat memanggil endpoint.
}
