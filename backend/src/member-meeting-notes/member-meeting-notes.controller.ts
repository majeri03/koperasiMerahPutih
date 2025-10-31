// backend/src/member-meeting-notes/member-meeting-notes.controller.ts
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
import { MemberMeetingNotesService } from './member-meeting-notes.service';
import { CreateMemberMeetingNoteDto } from './dto/create-member-meeting-note.dto';
import { UpdateMemberMeetingNoteDto } from './dto/update-member-meeting-note.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard'; // Sesuaikan path
import { RolesGuard } from 'src/auth/guards/roles.guard'; // Sesuaikan path
import { Roles } from 'src/auth/decorators/roles.decorator'; // Sesuaikan path
import { Role } from 'src/auth/enums/role.enum'; // Sesuaikan path
import { FileInterceptor } from '@nestjs/platform-express';
import { JabatanGuard } from 'src/auth/guards/jabatan.guard';
import { JabatanPengurus } from 'src/auth/enums/jabatan-pengurus.enum';
import { Jabatan } from 'src/auth/decorators/jabatan.decorator';
// Import GetUser dan JwtPayloadDto jika diperlukan filter Anggota nanti
// import { GetUser } from 'src/auth/get-user.decorator';
// import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES =
  /(pdf|jpeg|png|webp|msword|wordprocessingml|ms-excel|spreadsheetml)/;

@ApiTags('Member Meeting Notes (Buku 07)') // Tag Swagger
@ApiBearerAuth() // Membutuhkan token
@UseGuards(JwtAuthGuard, RolesGuard, JabatanGuard) // Terapkan guard auth & roles
@Controller('member-meeting-notes')
export class MemberMeetingNotesController {
  constructor(
    private readonly memberMeetingNotesService: MemberMeetingNotesService,
  ) {}

  @Post()
  @Roles(Role.Pengurus) // Hanya Pengurus (Sekretaris sesuai PDF)
  @Jabatan(JabatanPengurus.Sekretaris)
  @ApiOperation({ summary: 'Membuat notulen rapat anggota baru' })
  @ApiBody({ type: CreateMemberMeetingNoteDto })
  create(@Body() createDto: CreateMemberMeetingNoteDto) {
    return this.memberMeetingNotesService.create(createDto);
  }

  @Get()
  @Roles(Role.Pengurus, Role.Anggota, Role.Pengawas) // Pengurus dan Anggota boleh lihat daftar
  @ApiOperation({ summary: 'Mendapatkan daftar semua notulen rapat anggota' })
  // Jika Anggota hanya boleh lihat notulen tertentu, perlu logic tambahan + GetUser
  findAll() {
    return this.memberMeetingNotesService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // Pengurus dan Anggota boleh lihat detail
  @ApiOperation({ summary: 'Mendapatkan detail satu notulen rapat anggota' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  // Jika Anggota hanya boleh lihat notulen tertentu, perlu logic tambahan + GetUser
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.memberMeetingNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Sekretaris)
  @ApiOperation({ summary: 'Memperbarui data notulen rapat anggota' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  @ApiBody({ type: UpdateMemberMeetingNoteDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMemberMeetingNoteDto,
  ) {
    return this.memberMeetingNotesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus (Sekretaris)
  @Jabatan(JabatanPengurus.Sekretaris)
  @HttpCode(HttpStatus.NO_CONTENT) // Status 204
  @ApiOperation({ summary: 'Menghapus data notulen rapat anggota' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.memberMeetingNotesService.remove(id);
  }
  @Post(':id/document') // Endpoint baru: POST /member-meeting-notes/:id/document
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Sekretaris)
  @UseInterceptors(FileInterceptor('file')) // Menangkap file dari key 'file'
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload/Ganti dokumen notulen (Hanya Pengurus)',
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
    return this.memberMeetingNotesService.updateDocument(id, file);
  }
}
