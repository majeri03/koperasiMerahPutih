// backend/src/employees/dto/update-employee.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  // Tambahkan field khusus untuk update (misal saat berhenti)
  @ApiProperty({
    example: '2026-12-31',
    description: 'Tanggal berhenti (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  terminationDate?: string | null; // Bisa null jika status diaktifkan kembali

  @ApiProperty({ example: 'Pindah kerja', required: false })
  @IsString()
  @IsOptional()
  terminationReason?: string | null;

  // Field approval (approvedByPengurusId, approvedByKetuaId, ketuaApprovalDate)
  // Sebaiknya diupdate melalui endpoint/method terpisah agar lebih terkontrol,
  // jadi tidak dimasukkan di DTO update umum ini.
}
