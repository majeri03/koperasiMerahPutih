// backend/src/loans/dto/create-loan.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({
    example: 'uuid-anggota-123',
    description: 'ID Anggota yang mengajukan pinjaman',
  })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ example: 5000000, description: 'Jumlah pokok pinjaman' })
  @IsNumber()
  @Min(1) // Minimal pinjaman 1
  loanAmount: number;

  @ApiProperty({ example: 1.5, description: 'Suku bunga per bulan (%)' })
  @IsNumber()
  @Min(0) // Bunga minimal 0%
  interestRate: number;

  @ApiProperty({
    example: '2025-10-22',
    description: 'Tanggal pinjaman diberikan (YYYY-MM-DD)',
  })
  @IsDateString()
  loanDate: string;

  @ApiProperty({ example: 12, description: 'Jangka waktu pinjaman (bulan)' })
  @IsInt()
  @Min(1) // Minimal 1 bulan
  termMonths: number;

  @ApiProperty({
    example: 'Modal Usaha Warung',
    description: 'Tujuan penggunaan pinjaman',
    required: false,
  })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty({
    example: 'PJ/KMP/X/2025/001',
    description: 'Nomor surat perjanjian pinjaman',
    required: false,
  })
  @IsString()
  @IsOptional()
  agreementNumber?: string;

  // loanNumber, dueDate, status, paidOffDate, installments akan di-generate/di-handle oleh service
}
