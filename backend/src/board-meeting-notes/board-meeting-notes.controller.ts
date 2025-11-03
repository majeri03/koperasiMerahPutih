// backend/src/board-meeting-notes/board-meeting-notes.controller.ts
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
} from '@nestjs/common';
import { BoardMeetingNotesService } from './board-meeting-notes.service';
import { CreateBoardMeetingNoteDto } from './dto/create-board-meeting-note.dto';
import { UpdateBoardMeetingNoteDto } from './dto/update-board-meeting-note.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard'; // Sesuaikan path
import { RolesGuard } from 'src/auth/guards/roles.guard'; // Sesuaikan path
import { Roles } from 'src/auth/decorators/roles.decorator'; // Sesuaikan path
import { Role } from 'src/auth/enums/role.enum'; // Sesuaikan path
import { JabatanGuard } from 'src/auth/guards/jabatan.guard';
import { JabatanPengurus } from 'src/auth/enums/jabatan-pengurus.enum';
import { Jabatan } from 'src/auth/decorators/jabatan.decorator';
@ApiTags('Board Meeting Notes (Buku 08)') // Tag Swagger
@ApiBearerAuth() // Membutuhkan token
@UseGuards(JwtAuthGuard, RolesGuard, JabatanGuard) // Terapkan guard auth & roles
@Controller('board-meeting-notes')
export class BoardMeetingNotesController {
  constructor(
    private readonly boardMeetingNotesService: BoardMeetingNotesService,
  ) {}

  @Post()
  @Roles(Role.Pengurus) // Hanya Pengurus (Sekretaris/Ketua sesuai PDF)
  @Jabatan(JabatanPengurus.Ketua, JabatanPengurus.Sekretaris)
  @ApiOperation({ summary: 'Membuat notulen rapat pengurus baru' })
  @ApiBody({ type: CreateBoardMeetingNoteDto })
  create(@Body() createDto: CreateBoardMeetingNoteDto) {
    return this.boardMeetingNotesService.create(createDto);
  }

  @Get()
  @Roles(Role.Pengurus) // Hanya Pengurus yang boleh lihat
  @Jabatan(JabatanPengurus.Ketua, JabatanPengurus.Sekretaris)
  @ApiOperation({ summary: 'Mendapatkan daftar semua notulen rapat pengurus' })
  findAll() {
    return this.boardMeetingNotesService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Ketua, JabatanPengurus.Sekretaris)
  @ApiOperation({ summary: 'Mendapatkan detail satu notulen rapat pengurus' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardMeetingNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus
  @Jabatan(JabatanPengurus.Ketua, JabatanPengurus.Sekretaris)
  @ApiOperation({ summary: 'Memperbarui data notulen rapat pengurus' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  @ApiBody({ type: UpdateBoardMeetingNoteDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBoardMeetingNoteDto,
  ) {
    return this.boardMeetingNotesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Ketua, JabatanPengurus.Sekretaris)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus data notulen rapat pengurus' })
  @ApiParam({ name: 'id', description: 'ID Notulen (UUID)', type: String })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.boardMeetingNotesService.remove(id);
  }
}
