// src/guest-book/guest-book.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, // <-- Impor UseGuards
  ParseUUIDPipe, // <-- Impor ParseUUIDPipe
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GuestBookService } from './guest-book.service';
import { CreateGuestBookDto } from './dto/create-guest-book.dto';
import { UpdateGuestBookDto } from './dto/update-guest-book.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth, // <-- Impor ApiBearerAuth
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard'; // <-- Impor JwtAuthGuard
import { RolesGuard } from 'src/auth/guards/roles.guard'; // <-- Impor RolesGuard
import { Roles } from 'src/auth/decorators/roles.decorator'; // <-- Impor Roles
import { Role } from 'src/auth/enums/role.enum'; // <-- Impor Role

@ApiTags('Guest Book (Buku 11)') // Tag untuk Swagger
@Controller('guest-book')
export class GuestBookController {
  constructor(private readonly guestBookService: GuestBookService) {}

  /**
   * Endpoint Publik (Tamu, Anggota, Pengurus).
   * Sesuai dokumen, Tamu bisa 'Create'.pdf, p. 3].
   * Tidak memerlukan @UseGuards.
   */
  @Post()
  @ApiOperation({ summary: 'Membuat entri buku tamu baru (Publik)' })
  @ApiBody({ type: CreateGuestBookDto })
  create(@Body() createGuestBookDto: CreateGuestBookDto) {
    return this.guestBookService.create(createGuestBookDto);
  }

  /**
   * Endpoint Terproteksi (Anggota, Pengurus).
   * Sesuai dokumen, Anggota bisa 'Read'.pdf, p. 3].
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- Lindungi
  @Roles(Role.Pengurus, Role.Anggota) // <-- Izinkan Pengurus & Anggota
  @ApiBearerAuth() // <-- Tanda butuh token
  @ApiOperation({
    summary: 'Mendapatkan semua entri buku tamu (Anggota & Pengurus)',
  })
  findAll() {
    return this.guestBookService.findAll();
  }

  /**
   * Endpoint Terproteksi (Anggota, Pengurus).
   * Sesuai dokumen, Anggota bisa 'Read'.pdf, p. 3].
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- Lindungi
  @Roles(Role.Pengurus, Role.Anggota) // <-- Izinkan Pengurus & Anggota
  @ApiBearerAuth() // <-- Tanda butuh token
  @ApiOperation({
    summary: 'Mendapatkan detail satu entri buku tamu (Anggota & Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID Entri Buku Tamu (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestBookService.findOne(id);
  }

  /**
   * Endpoint Terproteksi (Hanya Pengurus).
   * Sesuai dokumen, hanya Pengurus yang bisa 'Update'.pdf, p. 3].
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- Lindungi
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiBearerAuth() // <-- Tanda butuh token
  @ApiOperation({ summary: 'Memperbarui entri buku tamu (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Entri Buku Tamu (UUID)' })
  @ApiBody({ type: UpdateGuestBookDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGuestBookDto: UpdateGuestBookDto,
  ) {
    return this.guestBookService.update(id, updateGuestBookDto);
  }

  /**
   * Endpoint Terproteksi (Hanya Pengurus).
   * Sesuai dokumen, hanya Pengurus yang bisa 'Delete'.pdf, p. 3].
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- Lindungi
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiBearerAuth() // <-- Tanda butuh token
  @HttpCode(HttpStatus.NO_CONTENT) // <-- Status 204
  @ApiOperation({ summary: 'Menghapus entri buku tamu (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Entri Buku Tamu (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.guestBookService.remove(id);
  }
}
