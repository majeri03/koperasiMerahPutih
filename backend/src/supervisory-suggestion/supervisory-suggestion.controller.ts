// src/supervisory-suggestion/supervisory-suggestion.controller.ts
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
import { SupervisorySuggestionService } from './supervisory-suggestion.service';
import { CreateSupervisorySuggestionDto } from './dto/create-supervisory-suggestion.dto';
import { UpdateSupervisorySuggestionDto } from './dto/update-supervisory-suggestion.dto';
import { RespondSupervisorySuggestionDto } from './dto/respond-supervisory-suggestion.dto';
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

@ApiTags('Supervisory Suggestions (Buku 13)') // Tag Swagger
@ApiBearerAuth() // Semua endpoint di modul ini butuh token
@UseGuards(JwtAuthGuard, RolesGuard) // Terapkan guard di level Controller
@Controller('supervisory-suggestion')
export class SupervisorySuggestionController {
  constructor(
    private readonly supervisorySuggestionService: SupervisorySuggestionService,
  ) {}

  /**
   * Endpoint HANYA untuk Pengurus (mencatat saran).
   */
  @Post()
  @Roles(Role.Pengurus, Role.Pengawas)
  @ApiOperation({ summary: 'Mencatat saran pengawas baru (Pengurus)' })
  @ApiBody({ type: CreateSupervisorySuggestionDto })
  create(@Body() createDto: CreateSupervisorySuggestionDto) {
    return this.supervisorySuggestionService.create(createDto);
  }

  /**
   * Endpoint HANYA untuk Pengurus (melihat semua saran).
   */
  @Get()
  @Roles(Role.Pengurus, Role.Pengawas)
  @ApiOperation({
    summary: 'Mendapatkan semua saran pengawas (Pengurus)',
  })
  findAll() {
    return this.supervisorySuggestionService.findAll();
  }

  /**
   * Endpoint HANYA untuk Pengurus (melihat detail saran).
   */
  @Get(':id')
  @Roles(Role.Pengurus, Role.Pengawas)
  @ApiOperation({
    summary: 'Mendapatkan detail satu saran pengawas (Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID Saran Pengawas (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervisorySuggestionService.findOne(id);
  }

  /**
   * Endpoint HANYA untuk Pengurus (memberi tanggapan).
   */
  @Post(':id/respond') // Gunakan POST untuk aksi
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Menambahkan tanggapan pengurus (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Saran Pengawas (UUID)' })
  @ApiBody({ type: RespondSupervisorySuggestionDto }) // Gunakan DTO Respond
  respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() respondDto: RespondSupervisorySuggestionDto,
    @GetUser() user: JwtPayloadDto, // Ambil info Pengurus penanggap
  ) {
    return this.supervisorySuggestionService.respond(id, respondDto, user);
  }

  /**
   * Endpoint HANYA untuk Pengurus (mengubah saran asli).
   */
  @Patch(':id')
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Memperbarui isi saran pengawas (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Saran Pengawas (UUID)' })
  @ApiBody({ type: UpdateSupervisorySuggestionDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSupervisorySuggestionDto,
  ) {
    return this.supervisorySuggestionService.update(id, updateDto);
  }

  /**
   * Endpoint HANYA untuk Pengurus (menghapus saran).
   */
  @Delete(':id')
  @Roles(Role.Pengurus)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus saran pengawas (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Saran Pengawas (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.supervisorySuggestionService.remove(id);
  }
}
