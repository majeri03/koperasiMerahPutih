// src/cooperative-profile/cooperative-profile.controller.ts
import {
  Controller,
  UseGuards,
  Get, // <-- Tambahkan
  Patch, // <-- Tambahkan
  Body, // <-- Tambahkan
  UseInterceptors, // <-- Tambahkan
  UploadedFile, // <-- Tambahkan
  ParseFilePipe, // <-- Tambahkan
  MaxFileSizeValidator, // <-- Tambahkan
  FileTypeValidator, // <-- Tambahkan
  HttpCode, // <-- Tambahkan
  HttpStatus,
} from '@nestjs/common';
import { CooperativeProfileService } from './cooperative-profile.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes, // <-- Tambahkan
  ApiOperation, // <-- Tambahkan
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { UpdateCooperativeProfileDto } from './dto/update-cooperative-profile.dto'; // <-- Tambahkan
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_LOGO_SIZE_MB = 2;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;
const ALLOWED_LOGO_TYPES = /(jpg|jpeg|png|webp)$/;

@ApiTags('Cooperative Profile (Tenant)')
@ApiBearerAuth()
// Hapus @Roles(Role.Pengurus) dari level class agar kita bisa set per method
@Controller('cooperative-profile')
export class CooperativeProfileController {
  constructor(
    private readonly cooperativeProfileService: CooperativeProfileService,
  ) {}

  /**
   * Endpoint untuk mengambil data profil koperasi.
   * Bisa diakses oleh Anggota dan Pengurus.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus, Role.Anggota) // <-- Perbolehkan Anggota melihat
  @ApiOperation({
    summary: 'Mendapatkan data profil koperasi (Pengurus & Anggota)',
  })
  getProfile() {
    return this.cooperativeProfileService.getProfile();
  }

  /**
   * Endpoint untuk memperbarui data profil koperasi.
   * Hanya bisa diakses oleh Pengurus.
   */
  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus) // <-- HANYA Pengurus yang boleh update
  @ApiOperation({
    summary: 'Memperbarui data profil koperasi (Hanya Pengurus)',
  })
  @ApiBody({ type: UpdateCooperativeProfileDto })
  updateProfile(@Body() updateDto: UpdateCooperativeProfileDto) {
    return this.cooperativeProfileService.updateProfile(updateDto);
  }

  /**
   * (BARU) Endpoint untuk upload logo.
   * Menggunakan PATCH agar semantik (memperbarui sebagian resource profile).
   */
  @Patch('logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus) // Hanya Pengurus
  @UseInterceptors(FileInterceptor('file')) // Menangkap file dari key 'file'
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload atau ganti logo koperasi (Hanya Pengurus)',
  })
  @ApiConsumes('multipart/form-data') // Tanda bahwa ini menerima form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Penting untuk Swagger UI
        },
      },
    },
  })
  uploadLogo(
    // Validasi file terjadi di sini (optimasi)
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_LOGO_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_LOGO_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.cooperativeProfileService.updateLogo(file);
  }

  @Get('public')
  findOnePublic() {
    // Fungsi ini tidak memiliki @UseGuards, jadi ini publik
    return this.cooperativeProfileService.findOnePublic();
  }
}
