// backend/src/board-positions/dto/update-board-position.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateBoardPositionDto } from './create-board-position.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBoardPositionDto extends PartialType(CreateBoardPositionDto) {
  // Tambahkan field khusus untuk update (misalnya saat berhenti)
  @ApiProperty({ example: '2025-12-31', description: 'Tanggal berhenti (YYYY-MM-DD)', required: false })
  @IsDateString()
  @IsOptional()
  tanggalBerhenti?: string;

  @ApiProperty({ example: 'Mengundurkan diri', required: false })
  @IsString()
  @IsOptional()
  alasanBerhenti?: string;
}
