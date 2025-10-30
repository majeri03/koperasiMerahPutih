// backend/src/supervisory-meeting-notes/supervisory-meeting-notes.controller.ts
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
  UseInterceptors, // <-- TAMBAHKAN
  UploadedFile, // <-- TAMBAHKAN
  ParseFilePipe, // <-- TAMBAHKAN
  MaxFileSizeValidator, // <-- TAMBAHKAN
  FileTypeValidator,
} from '@nestjs/common';
import { SupervisoryMeetingNotesService } from './supervisory-meeting-notes.service'; // Nama service yang benar
import { CreateSupervisoryMeetingNoteDto } from './dto/create-supervisory-meeting-note.dto'; // DTO yang benar
import { UpdateSupervisoryMeetingNoteDto } from './dto/update-supervisory-meeting-note.dto'; // DTO yang benar
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
// Regex yang sudah benar (menggunakan MIME type keywords)
const ALLOWED_FILE_TYPES =
  /(pdf|jpeg|png|webp|msword|wordprocessingml|ms-excel|spreadsheetml)/;
@ApiTags('Supervisory Meeting Notes (Buku 09)') // Tag Swagger baru
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('supervisory-meeting-notes') // Path URL baru
export class SupervisoryMeetingNotesController {
  constructor(
    // Inject service yang benar
    private readonly supervisoryMeetingNotesService: SupervisoryMeetingNotesService,
  ) {}

  @Post()
  @Roles(Role.Pengurus) // Akses dibatasi untuk Pengurus
  @ApiOperation({ summary: 'Membuat notulen rapat pengawas baru' })
  @ApiBody({ type: CreateSupervisoryMeetingNoteDto }) // Gunakan DTO yang benar
  create(@Body() createDto: CreateSupervisoryMeetingNoteDto) {
    // Gunakan DTO yang benar
    return this.supervisoryMeetingNotesService.create(createDto);
  }

  @Get()
  @Roles(Role.Pengurus) // Hanya Pengurus boleh lihat
  @ApiOperation({ summary: 'Mendapatkan daftar semua notulen rapat pengawas' })
  findAll() {
    return this.supervisoryMeetingNotesService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus boleh lihat detail
  @ApiOperation({ summary: 'Mendapatkan detail satu notulen rapat pengawas' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervisoryMeetingNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus
  @ApiOperation({ summary: 'Memperbarui data notulen rapat pengawas' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  @ApiBody({ type: UpdateSupervisoryMeetingNoteDto }) // Gunakan DTO yang benar
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSupervisoryMeetingNoteDto, // Gunakan DTO yang benar
  ) {
    return this.supervisoryMeetingNotesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus data notulen rapat pengawas' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.supervisoryMeetingNotesService.remove(id);
  }

  @Post(':id/document') // Endpoint baru: POST /supervisory-meeting-notes/:id/document
  @Roles(Role.Pengurus)
  @UseInterceptors(FileInterceptor('file')) // Menangkap file dari key 'file'
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload/Ganti dokumen notulen pengawas (Hanya Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  updateDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      // Validasi file di sini
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Panggil service yang baru kita buat
    return this.supervisoryMeetingNotesService.updateDocument(id, file);
  }
}
