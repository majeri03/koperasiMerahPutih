// src/products/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Beras Premium 5kg',
    description: 'Nama produk',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'Beras pulen berkualitas...',
    description: 'Deskripsi produk (opsional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 65000,
    description: 'Harga produk (dalam satuan terkecil, misal Rupiah tanpa sen)',
    type: 'integer',
  })
  @IsInt({ message: 'Harga harus berupa angka bulat (integer).' })
  @Min(0, { message: 'Harga tidak boleh negatif.' })
  @IsNotEmpty()
  // Transformasi input (misal string "65000") menjadi angka
  @Transform(
    ({ value }) => {
      // Lebih eksplisit menangani tipe input
      if (typeof value === 'number') {
        // Jika sudah angka, pastikan itu integer
        return Number.isInteger(value) ? value : NaN; // Return NaN jika bukan integer
      }
      if (typeof value === 'string') {
        // Jika string, coba parse
        const parsed = parseInt(value.trim(), 10); // Trim whitespace
        // Return hasil parse jika valid, jika tidak return NaN
        return isNaN(parsed) ? NaN : parsed;
      }
      // Jika tipe lain (boolean, object, dll), return NaN agar validasi @IsInt gagal
      return NaN;
    },
    { toClassOnly: true },
  )
  price: number; // Tipe tetap number, tapi validasi memastikan integer

  @ApiProperty({
    example: 'karung',
    description: 'Satuan produk (opsional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  unit?: string;

  @ApiProperty({
    example: 'BRS-PREM-5KG',
    description: 'Kode SKU produk (opsional, unik jika diisi)',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({
    example: true,
    description: 'Status ketersediaan produk (opsional, default true)',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  // Transformasi input string "true"/"false" atau boolean
  @Transform(({ value }) => value === 'true' || value === true, {
    toClassOnly: true,
  })
  isAvailable?: boolean;

  @ApiProperty({
    example: 'uuid-kategori-sembako',
    description: 'ID Kategori Produk',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  // imageUrl dihandle terpisah
}
