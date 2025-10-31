import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe, // <-- Tambahkan ParseUUIDPipe
  Query, // <-- Tambahkan Query
  ParseBoolPipe, // <-- Tambahkan ParseBoolPipe
  DefaultValuePipe, // <-- Tambahkan DefaultValuePipe
  HttpCode, // <-- Tambahkan HttpCode
  HttpStatus,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { JabatanGuard } from 'src/auth/guards/jabatan.guard';
import { Jabatan } from 'src/auth/decorators/jabatan.decorator';
import { JabatanPengurus } from 'src/auth/enums/jabatan-pengurus.enum';
@ApiTags('Members (Buku 01)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, JabatanGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(Role.Pengurus) // Hanya Pengurus
  @ApiOperation({
    summary: '(Pengurus) Membuat data anggota baru secara manual',
  })
  @ApiBody({ type: CreateMemberDto })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @Roles(Role.Pengurus, Role.Anggota, Role.Pengawas) // Pengurus & Anggota
  @ApiOperation({
    summary: '(Pengurus & Anggota) Mendapatkan daftar semua anggota',
  })
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // Pengurus & Anggota
  @ApiOperation({
    summary: '(Pengurus & Anggota) Mendapatkan detail satu anggota',
  })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus
  @ApiOperation({ summary: '(Pengurus) Memperbarui data anggota' })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  @ApiBody({ type: UpdateMemberDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }

  // --- UBAH METHOD INI ---
  @Delete(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus
  @Jabatan(JabatanPengurus.Ketua)
  @HttpCode(HttpStatus.OK) // Bisa OK atau NO_CONTENT, OK jika mengembalikan data member yg diupdate
  @ApiOperation({
    summary: '(Pengurus) Menonaktifkan keanggotaan (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  @ApiQuery({
    name: 'reason',
    required: false,
    description: 'Alasan berhenti/dipecat',
    type: String,
  })
  @ApiQuery({
    name: 'expelled',
    required: false,
    description: 'Apakah anggota dipecat?',
    type: Boolean,
    example: false,
  })
  terminate(
    // <-- Ganti nama method menjadi terminate
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string, // Ambil alasan dari query
    @Query('expelled', new DefaultValuePipe(false), ParseBoolPipe)
    isExpelled?: boolean, // Ambil status dipecat dari query
  ) {
    // Panggil service terminate, teruskan reason dan isExpelled
    return this.membersService.terminate(id, reason, isExpelled); // <-- Ganti pemanggilan ke terminate
  }
  // --- AKHIR PERUBAHAN ---

  // --- ENDPOINT APPROVAL KETUA (OPSIONAL) ---
  @Patch(':id/approve-ketua')
  @Roles(Role.Pengurus) // Idealnya ada Role.Ketua atau JabatanGuard
  @Jabatan(JabatanPengurus.Ketua) // Uncomment jika JabatanGuard sudah siap
  @ApiOperation({ summary: '(Ketua) Memberikan approval pada data anggota' })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  approveByKetua(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayloadDto, // Ambil ID Ketua dari user yg login
  ) {
    // TODO: Tambahkan validasi di service/guard bahwa user.userId adalah Ketua
    return this.membersService.approveByKetua(id, user.userId);
  }

  @Patch(':id/approve-termination-ketua')
  @Roles(Role.Pengurus) // Idealnya ada Role.Ketua atau JabatanGuard
  @Jabatan(JabatanPengurus.Ketua) // Uncomment jika JabatanGuard sudah siap
  @ApiOperation({
    summary: '(Ketua) Memberikan approval pada proses pemberhentian anggota',
  })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  approveTerminationByKetua(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayloadDto, // Ambil ID Ketua dari user yg login
  ) {
    // TODO: Tambahkan validasi di service/guard bahwa user.userId adalah Ketua
    return this.membersService.approveTerminationByKetua(id, user.userId);
  }
}
