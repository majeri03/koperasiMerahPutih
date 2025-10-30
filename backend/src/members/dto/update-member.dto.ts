import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @ApiProperty({
    example: '2026-01-15',
    description: 'Tanggal mengajukan berhenti (opsional)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  resignationRequestDate?: string | null;

  @ApiProperty({
    example: '2026-02-01',
    description: 'Tanggal berhenti efektif / dipecat (opsional)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  terminationDate?: string | null;

  @ApiProperty({
    example: 'Mengundurkan diri karena pindah domisili',
    description: 'Alasan berhenti atau dipecat (opsional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  terminationReason?: string | null;
}
