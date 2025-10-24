// src/agenda-expedition/agenda-expedition.controller.ts
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
import { AgendaExpeditionService } from './agenda-expedition.service';
import { CreateAgendaExpeditionDto } from './dto/create-agenda-expedition.dto';
import { UpdateAgendaExpeditionDto } from './dto/update-agenda-expedition.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
// GetUser dan JwtPayloadDto tidak diimpor karena tidak digunakan

@ApiTags('Agenda Expeditions (Buku 16)') // Tag Swagger
@ApiBearerAuth() // Semua endpoint di modul ini butuh token
@UseGuards(JwtAuthGuard, RolesGuard) // Terapkan guard di level Controller
@Controller('agenda-expedition')
export class AgendaExpeditionController {
  constructor(
    private readonly agendaExpeditionService: AgendaExpeditionService,
  ) {}

  /**
   * Endpoint HANYA untuk Pengurus (mencatat entri).
   * Sesuai dokumen: Pengurus punya 'CRUD'.pdf, p. 3].
   */
  @Post()
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Mencatat entri agenda/ekspedisi baru (Pengurus)' })
  @ApiBody({ type: CreateAgendaExpeditionDto })
  create(@Body() createDto: CreateAgendaExpeditionDto) {
    // Tidak perlu mengirim user ke service
    return this.agendaExpeditionService.create(createDto);
  }

  /**
   * Endpoint untuk Pengurus & Anggota.
   * Sesuai dokumen: Anggota bisa 'Read-only'.pdf, p. 3].
   */
  @Get()
  @Roles(Role.Pengurus, Role.Anggota) // <-- Pengurus & Anggota
  @ApiOperation({
    summary: 'Mendapatkan semua entri agenda/ekspedisi (Pengurus & Anggota)',
  })
  findAll() {
    return this.agendaExpeditionService.findAll();
  }

  /**
   * Endpoint untuk Pengurus & Anggota.
   * Sesuai dokumen: Anggota bisa 'Read-only'.pdf, p. 3].
   */
  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // <-- Pengurus & Anggota
  @ApiOperation({
    summary:
      'Mendapatkan detail satu entri agenda/ekspedisi (Pengurus & Anggota)',
  })
  @ApiParam({ name: 'id', description: 'ID Entri Agenda/Ekspedisi (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.agendaExpeditionService.findOne(id);
  }

  /**
   * Endpoint HANYA untuk Pengurus (mengedit entri).
   */
  @Patch(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Memperbarui entri agenda/ekspedisi (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Entri Agenda/Ekspedisi (UUID)' })
  @ApiBody({ type: UpdateAgendaExpeditionDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAgendaExpeditionDto,
  ) {
    // Tidak perlu mengirim user ke service
    return this.agendaExpeditionService.update(id, updateDto);
  }

  /**
   * Endpoint HANYA untuk Pengurus (menghapus entri).
   */
  @Delete(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus entri agenda/ekspedisi (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Entri Agenda/Ekspedisi (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.agendaExpeditionService.remove(id);
  }
}
