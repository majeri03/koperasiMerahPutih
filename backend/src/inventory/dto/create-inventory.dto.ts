// backend/src/inventory/dto/create-inventory.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { InventoryCondition } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ example: 'Laptop Kantor 01', description: 'Nama Barang' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Tanggal Pembelian (YYYY-MM-DD)',
  })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({ example: 1, description: 'Jumlah Barang' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 12000000, description: 'Harga Satuan (Rp)' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  // totalValue akan dihitung di service

  @ApiProperty({
    example: 5,
    description: 'Taksiran Umur Teknis (tahun)',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  technicalLifeSpan?: number;

  @ApiProperty({
    example: 3,
    description: 'Taksiran Umur Ekonomis (tahun)',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  economicLifeSpan?: number;

  @ApiProperty({
    // Definisikan nilai enum secara eksplisit sebagai array string
    enum: ['BAIK', 'PERLU_PERBAIKAN', 'RUSAK'],
    example: 'BAIK',
    description: 'Kondisi Barang',
    required: false,
  })
  @IsEnum(InventoryCondition, {
    message: 'Kondisi harus salah satu dari BAIK, PERLU_PERBAIKAN, RUSAK',
  })
  @IsOptional()
  condition?: InventoryCondition;

  @ApiProperty({
    example: 'Ruang Rapat Lt. 2',
    description: 'Lokasi Penyimpanan',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'Pembelian dari Toko ABC',
    description: 'Keterangan Tambahan',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  // itemCode akan digenerate oleh service
}
