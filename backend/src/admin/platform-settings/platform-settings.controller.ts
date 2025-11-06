// src/admin/platform-settings/platform-settings.controller.ts
import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Post, // <-- Tambahkan Post
  UseInterceptors, // <-- Tambahkan UseInterceptors
  UploadedFile, // <-- Tambahkan UploadedFile
  ParseFilePipe, // <-- Tambahkan ParseFilePipe
  MaxFileSizeValidator, // <-- Tambahkan MaxFileSizeValidator
  FileTypeValidator, // <-- Tambahkan FileTypeValidator
  HttpCode, // <-- Tambahkan HttpCode
  HttpStatus, // <-- Tambahkan HttpStatus
} from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
import { CombinedSuperAdminGuard } from '../super-admin/super-admin.guard'; // <-- Import guard
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger'; // <-- Import dekorator Swagger
import { FileInterceptor } from '@nestjs/platform-express'; // <-- Import FileInterceptor
import { UploadPlatformImageDto } from './dto/upload-platform-image.dto'; // <-- Import DTO Upload

// Konstanta validasi gambar (bisa disesuaikan)
const MAX_PLATFORM_IMAGE_SIZE_MB = 5;
const MAX_PLATFORM_IMAGE_SIZE_BYTES = MAX_PLATFORM_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_PLATFORM_IMAGE_TYPES = /(jpg|jpeg|png|webp|svg)$/; // Izinkan SVG untuk logo?

@ApiTags('Admin - Platform Settings') // Tag Swagger
@ApiBearerAuth('superadmin-jwt') // Terapkan skema auth ke seluruh controller
@Controller('admin/platform-settings') // Prefix route
export class PlatformSettingsController {
  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  @Get()
  @UseGuards(CombinedSuperAdminGuard())
  @ApiOperation({ summary: 'Get all platform settings (Super Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all settings as a key-value object.',
  })
  findAll() {
    return this.platformSettingsService.getAllSettings();
  }

  @Patch()
  @UseGuards(CombinedSuperAdminGuard())
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update one or more platform settings (Super Admin)',
  })
  @ApiBody({ type: [UpdatePlatformSettingDto] }) // Terima array DTO
  @ApiResponse({ status: 200, description: 'Settings updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  update(@Body() updateDtos: UpdatePlatformSettingDto[]) {
    // Terima array DTO
    return this.platformSettingsService.updateSettings(updateDtos);
  }

  // --- Hapus method create, findOne, remove bawaan resource ---
  // @Post() create(...) {}
  // @Get(':id') findOne(...) {}
  // @Patch(':id') update(...) {} // Kita pakai PATCH / saja
  // @Delete(':id') remove(...) {}

  // --- TAMBAHKAN ENDPOINT UPLOAD BARU ---
  @Post('upload-image')
  @UseGuards(CombinedSuperAdminGuard())
  @UseInterceptors(FileInterceptor('file')) // Tangkap file dari form-data dengan key 'file'
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload an image for a platform setting (Super Admin)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    // Deskripsikan body multipart
    schema: {
      type: 'object',
      required: ['key', 'file'], // Keduanya wajib
      properties: {
        key: {
          type: 'string',
          description: 'Setting key (e.g., hero_image_url)',
        },
        file: { type: 'string', format: 'binary', description: 'Image file' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded and setting updated.',
    type: /*PlatformSettingEntity??*/ Object,
  }) // Ganti type jika perlu
  @ApiResponse({ status: 400, description: 'Invalid key or file.' })
  uploadImage(
    @Body() uploadDto: UploadPlatformImageDto, // Ambil 'key' dari body
    @UploadedFile(
      // Validasi file
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PLATFORM_IMAGE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_PLATFORM_IMAGE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.platformSettingsService.uploadImageAndUpdateSetting(
      uploadDto.key,
      file,
    );
  }
  // --- AKHIR ENDPOINT UPLOAD ---

  @Get('public')
  findAllPublic() {
    // Hapus @Query('key') dan panggil fungsi baru
    return this.platformSettingsService.findAllPublic();
  }
}
