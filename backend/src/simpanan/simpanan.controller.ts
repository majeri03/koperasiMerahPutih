// src/simpanan/simpanan.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SimpananService } from './simpanan.service';
import { CreateSimpananTransaksiDto } from './dto/create-simpanan-transaksi.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JabatanGuard } from 'src/auth/guards/jabatan.guard';
import { Jabatan } from 'src/auth/decorators/jabatan.decorator';

@ApiTags('Simpanan Anggota (Buku 04)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, JabatanGuard)
@Controller('simpanan')
export class SimpananController {
  constructor(private readonly simpananService: SimpananService) {}

  @Post('transaksi')
  @Roles(Role.Pengurus)
  @Jabatan('Bendahara')
  @ApiOperation({
    summary: 'Mencatat transaksi simpanan baru (Setoran/Penarikan)',
  })
  createTransaksi(
    @Body() createDto: CreateSimpananTransaksiDto,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.simpananService.createTransaksi(createDto, user);
  }

  @Get('transaksi')
  @Roles(Role.Pengurus)
  @Jabatan('Bendahara')
  @ApiOperation({ summary: 'Mendapatkan semua riwayat transaksi simpanan' })
  @ApiQuery({
    name: 'memberId',
    required: false,
    description: 'Filter berdasarkan ID anggota',
  })
  findAllTransaksi(@Query('memberId') memberId?: string) {
    return this.simpananService.findAllTransaksi(memberId);
  }

  @Get('transaksi/saya')
  @Roles(Role.Anggota)
  @ApiOperation({
    summary: 'Mendapatkan riwayat transaksi simpanan milik anggota yang login',
  })
  findMyTransaksi(@GetUser() user: JwtPayloadDto) {
    const memberId = user.userId;
    return this.simpananService.findAllTransaksi(memberId);
  }

  @Get('saldo/saya')
  @Roles(Role.Anggota)
  @ApiOperation({
    summary: 'Mendapatkan saldo simpanan milik anggota yang login',
  })
  findMySaldo(@GetUser() user: JwtPayloadDto) {
    const memberId = user.userId;
    return this.simpananService.findSaldoByMemberId(memberId);
  }

  @Get('saldo/total')
  @Roles(Role.Pengurus)
  @Jabatan('Bendahara')
  @ApiOperation({
    summary: 'Mendapatkan total akumulasi simpanan per jenis di koperasi',
  })
  findTotalSaldo() {
    return this.simpananService.getAggregatedSaldo();
  }
  @Get('saldo/:memberId')
  @Roles(Role.Pengurus)
  @Jabatan('Bendahara')
  @ApiOperation({
    summary: 'Mendapatkan saldo simpanan anggota berdasarkan ID',
  })
  findSaldoAnggota(@Param('memberId') memberId: string) {
    return this.simpananService.findSaldoByMemberId(memberId);
  }
}
