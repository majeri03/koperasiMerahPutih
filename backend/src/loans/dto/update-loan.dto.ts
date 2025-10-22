// backend/src/loans/dto/update-loan.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateLoanDto } from './create-loan.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  // Tambahkan field yang spesifik bisa di-update, tapi tidak saat create
  @ApiProperty({
    example: 'PAID_OFF',
    description: 'Status pinjaman (ACTIVE, PAID_OFF, OVERDUE)',
    required: false,
  })
  @IsString()
  @IsIn(['ACTIVE', 'PAID_OFF', 'OVERDUE']) // Hanya boleh salah satu dari nilai ini
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: '2026-10-22',
    description: 'Tanggal pinjaman lunas (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  paidOffDate?: string | null; // Bisa null jika status kembali ACTIVE
}
