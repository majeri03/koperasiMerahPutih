// src/supervisory-suggestion/dto/respond-supervisory-suggestion.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RespondSupervisorySuggestionDto {
  @ApiProperty({
    example: 'Telah dilaksanakan, hasil audit terlampir di notulen pengurus.',
    description: 'Kolom 7: Tanggapan Pengurus',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tanggapan tidak boleh kosong.' })
  response: string;

  // Kolom 6 (Tanda Tangan Pengurus) akan diambil otomatis dari user
  // yang login (yang menanggapi) saat memanggil endpoint.
}
