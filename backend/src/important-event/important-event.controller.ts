// src/important-event/important-event.controller.ts
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
import { ImportantEventService } from './important-event.service';
import { CreateImportantEventDto } from './dto/create-important-event.dto';
import { UpdateImportantEventDto } from './dto/update-important-event.dto';
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
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';

@ApiTags('Important Events (Buku 15)') // Tag Swagger
@ApiBearerAuth() // Semua endpoint di modul ini butuh token
@UseGuards(JwtAuthGuard, RolesGuard) // Terapkan guard di level Controller
@Controller('important-event')
export class ImportantEventController {
  constructor(private readonly importantEventService: ImportantEventService) {}

  /**
   * Endpoint HANYA untuk Pengurus (mencatat kejadian).
   * Sesuai dokumen: Pengurus punya 'CRUD'.pdf, p. 3].
   */
  @Post()
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Mencatat kejadian penting baru (Pengurus)' })
  @ApiBody({ type: CreateImportantEventDto })
  create(
    @Body() createDto: CreateImportantEventDto,
    @GetUser() user: JwtPayloadDto, // <-- Ambil info Pengurus
  ) {
    return this.importantEventService.create(createDto, user);
  }

  /**
   * Endpoint untuk Pengurus & Anggota.
   * Sesuai dokumen: Anggota bisa 'Read-only'.pdf, p. 3].
   */
  @Get()
  @Roles(Role.Pengurus, Role.Anggota) // <-- Pengurus & Anggota
  @ApiOperation({
    summary: 'Mendapatkan semua catatan kejadian penting (Pengurus & Anggota)',
  })
  findAll() {
    return this.importantEventService.findAll();
  }

  /**
   * Endpoint untuk Pengurus & Anggota.
   * Sesuai dokumen: Anggota bisa 'Read-only'.pdf, p. 3].
   */
  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // <-- Pengurus & Anggota
  @ApiOperation({
    summary: 'Mendapatkan detail satu kejadian penting (Pengurus & Anggota)',
  })
  @ApiParam({ name: 'id', description: 'ID Kejadian Penting (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.importantEventService.findOne(id);
  }

  /**
   * Endpoint HANYA untuk Pengurus (mengedit kejadian).
   */
  @Patch(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Memperbarui catatan kejadian penting (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Kejadian Penting (UUID)' })
  @ApiBody({ type: UpdateImportantEventDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateImportantEventDto,
    @GetUser() user: JwtPayloadDto, // <-- Ambil info Pengurus
  ) {
    return this.importantEventService.update(id, updateDto, user);
  }

  /**
   * Endpoint HANYA untuk Pengurus (menghapus kejadian).
   */
  @Delete(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus catatan kejadian penting (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Kejadian Penting (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.importantEventService.remove(id);
  }
}
