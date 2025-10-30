// src/official-recommendation/dto/create-official-recommendation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateOfficialRecommendationDto {
  @ApiProperty({
    example: 'Bpk. Dr. H. Syarifuddin, M.Si.',
    description: 'Kolom 3: Nama Pejabat',
  })
  @IsString()
  @IsNotEmpty()
  officialName: string;

  @ApiProperty({
    example: 'Kepala Dinas Koperasi, Jl. Merdeka No. 10',
    description: 'Kolom 4: Jabatan dan Alamat Pejabat',
  })
  @IsString()
  @IsNotEmpty()
  officialPositionAndAddress: string;

  @ApiProperty({
    example: 'Diharapkan koperasi segera melengkapi administrasi Buku 16.',
    description: 'Kolom 5: Isi Anjuran',
  })
  @IsString()
  @IsNotEmpty()
  recommendation: string;

  @ApiProperty({
    example: 'https://storage.example.com/ttd-pejabat-kadis.png',
    description: 'Kolom 6: URL Tanda Tangan Pejabat (Opsional)',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  documentUrl?: string;

  // Kolom 1, 2 (No Urut, Tanggal) akan di-handle database.
  // Kolom 7, 8 (Tanggapan) akan diisi via DTO lain.
}
