// src/uploads/uploads.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

// Definisikan konstanta untuk validasi agar mudah diubah
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = /(pdf|jpeg|jpg|png)$/; // Regex untuk PDF, JPG, JPEG, PNG

@ApiTags('Uploads') // Tag Swagger
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // --- Endpoint untuk Dokumen Pendaftaran Tenant ---

  @Post('tenant-registration/pengesahan-pendirian')
  @UseInterceptors(FileInterceptor('file')) // Menangkap file dari field 'file'
  @HttpCode(HttpStatus.CREATED) // Status 201 Created
  @ApiOperation({ summary: 'Unggah Dokumen Pengesahan Pendirian Tenant' })
  @ApiConsumes('multipart/form-data') // Menandakan input berupa form-data
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
  async uploadPengesahanPendirian(
    @UploadedFile(
      // Validasi file menggunakan Pipe
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File, // Tipe file dari @types/multer
  ) {
    const folder = 'tenant-registrations/pengesahan'; // Folder tujuan di R2
    return this.uploadsService.uploadFile(file, folder);
  }

  @Post('tenant-registration/daftar-umum')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Unggah Dokumen Daftar Umum Koperasi Tenant' })
  @ApiConsumes('multipart/form-data')
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
  async uploadDaftarUmum(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const folder = 'tenant-registrations/daftar-umum';
    return this.uploadsService.uploadFile(file, folder);
  }

  @Post('tenant-registration/akte-notaris')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Unggah Dokumen Akte Notaris Pendirian Tenant' })
  @ApiConsumes('multipart/form-data')
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
  async uploadAkteNotaris(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const folder = 'tenant-registrations/akte-notaris';
    return this.uploadsService.uploadFile(file, folder);
  }

  @Post('tenant-registration/npwp-koperasi')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Unggah Dokumen NPWP Koperasi Tenant' })
  @ApiConsumes('multipart/form-data')
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
  async uploadNpwpKoperasi(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const folder = 'tenant-registrations/npwp';
    return this.uploadsService.uploadFile(file, folder);
  }

  // --- Anda bisa menambahkan endpoint lain di sini untuk upload jenis file lain (misal: foto profil, scan KTP anggota, dll.) ---
}
