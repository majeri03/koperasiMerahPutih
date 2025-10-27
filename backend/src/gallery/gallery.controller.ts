// src/gallery/gallery.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { GalleryService, PaginatedGalleryResult } from './gallery.service';
import { CreateGalleryItemDto } from './dto/create-gallery.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

// Konstanta validasi gambar
const MAX_IMAGE_SIZE_MB = 5; // Ukuran disesuaikan
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = /(jpg|jpeg|png|webp|gif)$/; // Tambahkan gif jika perlu

@ApiTags('Gallery (Foto)')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  /**
   * (Pengurus) Upload foto baru ke galeri.
   * Menerima file gambar dan data DTO (deskripsi, order) sebagai multipart/form-data.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file')) // Tangkap file dari key 'file'
  @ApiOperation({ summary: 'Upload foto baru ke galeri (Hanya Pengurus)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'File gambar' },
        description: {
          type: 'string',
          description: 'Deskripsi (opsional)',
          maxLength: 255,
        },
        order: { type: 'integer', description: 'Urutan tampil (opsional)' },
      },
      required: ['file'], // File wajib ada
    },
  })
  create(
    @Body() createGalleryItemDto: CreateGalleryItemDto, // DTO menangkap description & order
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Kirim DTO dan file ke service
    return this.galleryService.create(createGalleryItemDto, file);
  }

  /**
   * (Publik) Get gallery items list (paginated).
   */
  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar item galeri (Publik)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ): Promise<PaginatedGalleryResult> {
    return this.galleryService.findAll(page, limit);
  }

  /**
   * (Pengurus) Update gallery item description or order by ID.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Memperbarui deskripsi/urutan item galeri (Hanya Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID unik item galeri (UUID)' })
  @ApiBody({ type: UpdateGalleryItemDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGalleryItemDto: UpdateGalleryItemDto,
  ) {
    return this.galleryService.update(id, updateGalleryItemDto);
  }

  /**
   * (Pengurus) Delete gallery item by ID.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus item galeri (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik item galeri (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.galleryService.remove(id);
  }
}
