// src/simpanan/dto/create-simpanan-transaksi.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { JenisSimpanan, TipeTransaksiSimpanan } from '@prisma/client'; // Import Enum dari Prisma

export class CreateSimpananTransaksiDto {
  @ApiProperty({
    example: 'uuid-anggota-123',
    description: 'ID Anggota yang melakukan transaksi',
  })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({
    enum: JenisSimpanan,
    example: JenisSimpanan.WAJIB,
    description: 'Jenis simpanan (POKOK, WAJIB, SUKARELA)',
  })
  @IsEnum(JenisSimpanan)
  @IsNotEmpty()
  jenis: JenisSimpanan;

  @ApiProperty({
    enum: TipeTransaksiSimpanan,
    example: TipeTransaksiSimpanan.SETORAN,
    description: 'Tipe transaksi (SETORAN, PENARIKAN)',
  })
  @IsEnum(TipeTransaksiSimpanan)
  @IsNotEmpty()
  tipe: TipeTransaksiSimpanan;

  @ApiProperty({ example: 100000, description: 'Jumlah nominal transaksi' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  jumlah: number;

  @ApiProperty({
    example: 'Setoran wajib bulan Oktober',
    description: 'Keterangan atau uraian transaksi',
  })
  @IsString()
  @IsNotEmpty()
  uraian: string;

  @ApiProperty({
    example: 'TRX-SIMP-12345',
    description: 'Nomor bukti transaksi (opsional, bisa digenerate)',
    required: false,
  })
  @IsString()
  @IsOptional()
  nomorBukti?: string;

  // Tanggal transaksi (opsional). Jika tidak diisi, backend akan memakai tanggal saat ini.
  @ApiProperty({
    example: '2025-10-22',
    description: 'Tanggal transaksi (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsString()
  tanggal?: string;
}
