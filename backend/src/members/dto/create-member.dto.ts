import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'Full Name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

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
    example: 'https://example.com/fingerprint.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  fingerprintUrl?: string;

  @ApiProperty({
    example: 'https://example.com/signature.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  signatureUrl?: string;
}
