// backend/src/loans/loans.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty, // Impor yang diperlukan
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard'; // Sesuaikan path
import { RolesGuard } from 'src/auth/guards/roles.guard'; // Sesuaikan path
import { Roles } from 'src/auth/decorators/roles.decorator'; // Sesuaikan path
import { Role } from 'src/auth/enums/role.enum'; // Sesuaikan path
import { IsDateString, IsNumber, Min } from 'class-validator'; // Impor yang diperlukan
import { GetUser } from 'src/auth/get-user.decorator'; // Sesuaikan path jika perlu
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // Sesuaikan path jika perlu
import { JabatanGuard } from 'src/auth/guards/jabatan.guard';
import { JabatanPengurus } from 'src/auth/enums/jabatan-pengurus.enum';
import { Jabatan } from 'src/auth/decorators/jabatan.decorator';
// DTO sederhana untuk pembayaran angsuran
class PayInstallmentDto {
  @ApiProperty({
    example: '2025-11-10',
    description: 'Tanggal Pembayaran (YYYY-MM-DD)',
  })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ example: 550000, description: 'Jumlah yang dibayarkan' })
  @IsNumber()
  @Min(1)
  amountPaid: number;
}

@ApiTags('Loans (Buku 05)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, JabatanGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  // --- Endpoint Create ---
  @Post()
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Bendahara)
  @ApiOperation({ summary: 'Membuat data pinjaman baru untuk anggota' })
  @ApiBody({ type: CreateLoanDto })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  // --- Endpoint FindAll ---
  @Get()
  @Roles(Role.Pengurus, Role.Anggota, Role.Pengawas)
  @ApiOperation({
    summary: 'Mendapatkan daftar pinjaman (difilter berdasarkan peran)',
  })
  findAll(@GetUser() user: JwtPayloadDto) {
    // Terima user yang login
    return this.loansService.findAll(user); // Kirim user ke service
  }

  // --- Endpoint FindOne ---
  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota)
  @ApiOperation({
    summary: 'Mendapatkan detail pinjaman (difilter berdasarkan peran)',
  })
  @ApiParam({ name: 'id', description: 'ID Pinjaman (UUID)', type: String })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayloadDto, // Terima user yang login
  ) {
    return this.loansService.findOne(id, user); // Kirim user dan id ke service
  }

  // --- Endpoint Update ---
  @Patch(':id')
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Bendahara)
  @ApiOperation({
    summary: 'Memperbarui data pinjaman (misal: status, tanggal lunas)',
  })
  @ApiParam({ name: 'id', description: 'ID Pinjaman (UUID)', type: String })
  @ApiBody({ type: UpdateLoanDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, updateLoanDto);
  }

  // --- Endpoint Remove ---
  @Delete(':id')
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Bendahara)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus data pinjaman (hard delete)' })
  @ApiParam({ name: 'id', description: 'ID Pinjaman (UUID)', type: String })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.loansService.remove(id);
  }

  // --- Endpoint Pay Installment ---
  @Post('installments/:installmentId/pay')
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Bendahara)
  @ApiOperation({ summary: 'Mencatat pembayaran untuk satu angsuran' })
  @ApiParam({
    name: 'installmentId',
    description: 'ID Angsuran (UUID)',
    type: String,
  })
  @ApiBody({ type: PayInstallmentDto })
  payInstallment(
    @Param('installmentId', ParseUUIDPipe) installmentId: string,
    @Body() payInstallmentDto: PayInstallmentDto,
  ) {
    return this.loansService.payInstallment(
      installmentId,
      payInstallmentDto.paymentDate,
      payInstallmentDto.amountPaid,
    );
  }
}
