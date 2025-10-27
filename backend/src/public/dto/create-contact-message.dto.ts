// src/public/dto/create-contact-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({
    example: 'Budi Darmawan',
    description: 'Nama lengkap pengirim pesan',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong.' })
  @MaxLength(100)
  senderName: string;

  @ApiProperty({
    example: 'budi.darmawan@email.com',
    description: 'Alamat email pengirim pesan',
  })
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  senderEmail: string;

  @ApiProperty({
    example: 'Pertanyaan tentang produk',
    description: 'Subjek atau perihal pesan',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'Subjek tidak boleh kosong.' })
  @MaxLength(150)
  subject: string;

  @ApiProperty({
    example: 'Saya ingin bertanya mengenai ketersediaan beras...',
    description: 'Isi pesan yang dikirim',
  })
  @IsString()
  @IsNotEmpty({ message: 'Pesan tidak boleh kosong.' })
  message: string;
}
