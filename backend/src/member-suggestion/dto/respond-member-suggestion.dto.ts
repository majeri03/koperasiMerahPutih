// src/member-suggestion/dto/respond-member-suggestion.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RespondMemberSuggestionDto {
  @ApiProperty({
    example:
      'Terima kasih atas sarannya, akan kami diskusikan di rapat pengurus.',
    description: 'Kolom 7: Tanggapan Pengurus',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tanggapan tidak boleh kosong.' })
  response: string;

  // Kolom 8 (Tanda Tangan Pengurus) akan diambil dari user yang login.
}
