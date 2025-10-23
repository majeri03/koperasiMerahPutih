// src/official-recommendation/official-recommendation.controller.ts
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
import { OfficialRecommendationService } from './official-recommendation.service';
import { CreateOfficialRecommendationDto } from './dto/create-official-recommendation.dto';
import { UpdateOfficialRecommendationDto } from './dto/update-official-recommendation.dto';
import { RespondOfficialRecommendationDto } from './dto/respond-official-recommendation.dto';
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

@ApiTags('Official Recommendations (Buku 14)') // Tag Swagger
@ApiBearerAuth() // Semua endpoint di modul ini butuh token
@UseGuards(JwtAuthGuard, RolesGuard) // Terapkan guard di level Controller
@Controller('official-recommendation')
export class OfficialRecommendationController {
  constructor(
    private readonly officialRecommendationService: OfficialRecommendationService,
  ) {}

  /**
   * Endpoint HANYA untuk Pengurus (mencatat anjuran).
   * Sesuai dokumen: Pengurus punya 'CRUD'.pdf, p. 3].
   */
  @Post()
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Mencatat anjuran pejabat baru (Pengurus)' })
  @ApiBody({ type: CreateOfficialRecommendationDto })
  create(@Body() createDto: CreateOfficialRecommendationDto) {
    return this.officialRecommendationService.create(createDto);
  }

  /**
   * Endpoint untuk Pengurus & Anggota.
   * Sesuai dokumen: Anggota bisa 'Read-only'.pdf, p. 3].
   */
  @Get()
  @Roles(Role.Pengurus, Role.Anggota) // <-- Pengurus & Anggota
  @ApiOperation({
    summary: 'Mendapatkan semua anjuran pejabat (Pengurus & Anggota)',
  })
  findAll() {
    return this.officialRecommendationService.findAll();
  }

  /**
   * Endpoint untuk Pengurus & Anggota.
   * Sesuai dokumen: Anggota bisa 'Read-only'.pdf, p. 3].
   */
  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // <-- Pengurus & Anggota
  @ApiOperation({
    summary: 'Mendapatkan detail satu anjuran pejabat (Pengurus & Anggota)',
  })
  @ApiParam({ name: 'id', description: 'ID Anjuran Pejabat (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.officialRecommendationService.findOne(id);
  }

  /**
   * Endpoint HANYA untuk Pengurus (memberi tanggapan).
   */
  @Post(':id/respond') // Gunakan POST untuk aksi
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Menambahkan tanggapan pengurus (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Anjuran Pejabat (UUID)' })
  @ApiBody({ type: RespondOfficialRecommendationDto }) // Gunakan DTO Respond
  respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() respondDto: RespondOfficialRecommendationDto,
    @GetUser() user: JwtPayloadDto, // Ambil info Pengurus penanggap
  ) {
    return this.officialRecommendationService.respond(id, respondDto, user);
  }

  /**
   * Endpoint HANYA untuk Pengurus (mengubah anjuran asli).
   */
  @Patch(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Memperbarui isi anjuran pejabat (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Anjuran Pejabat (UUID)' })
  @ApiBody({ type: UpdateOfficialRecommendationDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOfficialRecommendationDto,
  ) {
    return this.officialRecommendationService.update(id, updateDto);
  }

  /**
   * Endpoint HANYA untuk Pengurus (menghapus anjuran).
   */
  @Delete(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus anjuran pejabat (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Anjuran Pejabat (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.officialRecommendationService.remove(id);
  }
}
