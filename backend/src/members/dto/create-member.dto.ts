import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  Length,
  IsBase64,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'Full Name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '3301234567890001', description: 'NIK 16 digit' })
  @IsNumberString({}, { message: 'NIK harus berupa angka.' })
  @Length(16, 16, { message: 'NIK harus terdiri dari 16 digit.' })
  @IsNotEmpty({ message: 'NIK tidak boleh kosong.' }) // Pastikan NIK wajib diisi
  nik: string;

  @ApiProperty({ example: 'Makassar' })
  @IsString()
  @IsNotEmpty()
  placeOfBirth: string;

  @ApiProperty({ example: '1990-01-15', description: 'YYYY-MM-DD format' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'Swasta' })
  @IsString()
  @IsNotEmpty()
  occupation: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 10, Makassar' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: '081234567890',
    description: 'Nomor telepon anggota (opsional)',
    required: false,
  })
  @IsNumberString({}, { message: 'Nomor telepon harus berupa string angka.' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    example:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    description: 'Data Tanda Tangan Digital (Base64 Encoded String)',
    required: false, // Opsional saat create manual oleh Sekretaris
  })
  @IsString()
  @IsBase64() // Aktifkan jika ingin validasi format Base64 yang ketat
  @IsOptional()
  signatureData?: string;
}
