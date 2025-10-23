// backend/src/member-registrations/member-registrations.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get, // <-- Add Get
  Param, // <-- Add Param
  UseGuards, // <-- Add UseGuards
  ParseUUIDPipe, // <-- Add ParseUUIDPipe for ID validation
  Query,
  BadRequestException,
} from '@nestjs/common';
import { MemberRegistrationsService } from './member-registrations.service';
import { CreateMemberRegistrationDto } from './dto/create-member-registration.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth, // <-- Add ApiBearerAuth
  ApiParam, // <-- Add ApiParam
  ApiQuery, // <-- Add ApiQuery
} from '@nestjs/swagger';
// Remove unused imports like Request, PrismaService if not needed here
// import { Request } from 'express';
// import { PrismaService } from 'src/prisma/prisma.service';

// --- Import Guards, Decorators, Enum, DTO ---
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
// --- End Imports ---

@ApiTags('Member Registrations')
@Controller('member-registrations')
export class MemberRegistrationsController {
  constructor(
    private readonly memberRegistrationsService: MemberRegistrationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Menerima pendaftaran calon anggota baru (Publik)' })
  @ApiBody({ type: CreateMemberRegistrationDto })
  @ApiResponse({ status: 201, description: 'Pendaftaran berhasil diterima.' })
  @ApiResponse({ status: 400, description: 'Data tidak valid.' })
  @ApiResponse({
    status: 409,
    description: 'Konflik data (Email/NIK sudah ada).',
  })
  async handleRegistration(
    @Body() createDto: CreateMemberRegistrationDto,
  ): Promise<{ message: string; registrationId: string }> {
    const result =
      await this.memberRegistrationsService.createRegistration(createDto);
    return {
      message: 'Pendaftaran berhasil diterima dan sedang menunggu persetujuan.',
      registrationId: result.id,
    };
  }

  // --- ENDPOINT BARU DI BAWAH INI ---

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- Lindungi endpoint
  @Roles(Role.Pengurus) // <-- Hanya Pengurus
  @ApiBearerAuth() // <-- Tunjukkan butuh token di Swagger
  @ApiOperation({
    summary: 'Mendapatkan daftar pendaftaran anggota yang PENDING (Pengurus)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar pendaftaran pending berhasil diambil.',
  })
  @ApiResponse({ status: 403, description: 'Akses ditolak (bukan Pengurus).' })
  async getPendingRegistrations() {
    // Panggil service
    return this.memberRegistrationsService.getPendingRegistrations();
  }

  @Post(':id/approve') // Gunakan POST untuk aksi state change
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK) // Status 200 OK jika berhasil
  @ApiOperation({ summary: 'Menyetujui pendaftaran anggota (Pengurus)' })
  @ApiParam({
    name: 'id',
    description: 'ID Pendaftaran Anggota (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Pendaftaran berhasil disetujui, Member dan User dibuat.',
  })
  @ApiResponse({ status: 400, description: 'Pendaftaran sudah diproses.' })
  @ApiResponse({ status: 403, description: 'Akses ditolak.' })
  @ApiResponse({ status: 404, description: 'Pendaftaran tidak ditemukan.' })
  async approveRegistration(
    @Param('id', ParseUUIDPipe) registrationId: string, // Validasi ID adalah UUID
    @GetUser() user: JwtPayloadDto, // Dapatkan info Pengurus yang approve
  ): Promise<{ message: string; memberId: string; userId: string }> {
    const result = await this.memberRegistrationsService.approveRegistration(
      registrationId,
      user.userId,
    );
    return {
      message: 'Pendaftaran berhasil disetujui.',
      memberId: result.memberId,
      userId: result.userId,
    };
  }

  @Post(':id/reject') // Gunakan POST
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Menolak pendaftaran anggota (Pengurus)' })
  @ApiParam({
    name: 'id',
    description: 'ID Pendaftaran Anggota (UUID)',
    type: String,
  })
  @ApiQuery({
    name: 'reason',
    description: 'Alasan penolakan',
    required: true,
    type: String,
  }) // Ambil alasan dari query
  @ApiResponse({ status: 200, description: 'Pendaftaran berhasil ditolak.' })
  @ApiResponse({
    status: 400,
    description: 'Pendaftaran sudah diproses atau alasan tidak diisi.',
  })
  @ApiResponse({ status: 403, description: 'Akses ditolak.' })
  @ApiResponse({ status: 404, description: 'Pendaftaran tidak ditemukan.' })
  async rejectRegistration(
    @Param('id', ParseUUIDPipe) registrationId: string,
    @GetUser() user: JwtPayloadDto,
    @Query('reason') reason: string, // Ambil 'reason' dari query parameter (?reason=...)
  ): Promise<{ message: string }> {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Alasan penolakan (reason) wajib diisi.');
    }
    await this.memberRegistrationsService.rejectRegistration(
      registrationId,
      user.userId,
      reason,
    );
    return {
      message: 'Pendaftaran berhasil ditolak.',
    };
  }
  // --- AKHIR ENDPOINT BARU ---
}
