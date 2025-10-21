// backend/src/supervisory-positions/dto/update-supervisory-position.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSupervisoryPositionDto } from './create-supervisory-position.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupervisoryPositionDto extends PartialType(
  CreateSupervisoryPositionDto,
) {
  @ApiProperty({
    example: '2026-12-31',
    description: 'Tanggal berhenti (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  tanggalBerhenti?: string;

  @ApiProperty({ example: 'Masa jabatan berakhir', required: false })
  @IsString()
  @IsOptional()
  alasanBerhenti?: string;
}
