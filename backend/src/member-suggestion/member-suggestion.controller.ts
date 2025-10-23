// src/member-suggestion/member-suggestion.controller.ts
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
import { MemberSuggestionService } from './member-suggestion.service';
import { CreateMemberSuggestionDto } from './dto/create-member-suggestion.dto';
import { UpdateMemberSuggestionDto } from './dto/update-member-suggestion.dto';
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
import { GetUser } from 'src/auth/get-user.decorator'; // <-- Impor GetUser
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto'; // <-- Impor JwtPayloadDto
import { RespondMemberSuggestionDto } from './dto/respond-member-suggestion.dto'; // <-- Impor DTO Respond

@ApiTags('Member Suggestions (Buku 12)') // Tag Swagger
@ApiBearerAuth() // Semua endpoint di modul ini butuh token
@UseGuards(JwtAuthGuard, RolesGuard) // Terapkan guard di level Controller
@Controller('member-suggestion')
export class MemberSuggestionController {
  constructor(
    private readonly memberSuggestionService: MemberSuggestionService,
  ) {}

  /**
   * Endpoint untuk Anggota & Pengurus.
   * Sesuai dokumen: Anggota bisa 'Create'.pdf, p. 3].
   */
  @Post()
  @Roles(Role.Pengurus, Role.Anggota) // <-- Anggota & Pengurus bisa create
  @ApiOperation({ summary: 'Membuat saran anggota baru (Anggota & Pengurus)' })
  @ApiBody({ type: CreateMemberSuggestionDto })
  create(
    @Body() createDto: CreateMemberSuggestionDto,
    @GetUser() user: JwtPayloadDto, // <-- Ambil user yang login
  ) {
    // Kirim user ke service untuk ID member
    return this.memberSuggestionService.create(createDto, user);
  }

  /**
   * Endpoint untuk Anggota & Pengurus.
   * Sesuai dokumen: Anggota bisa 'Read'.pdf, p. 3].
   */
  @Get()
  @Roles(Role.Pengurus, Role.Anggota) // <-- Anggota & Pengurus bisa lihat
  @ApiOperation({
    summary: 'Mendapatkan semua saran anggota (Anggota & Pengurus)',
  })
  findAll() {
    return this.memberSuggestionService.findAll();
  }

  /**
   * Endpoint untuk Anggota & Pengurus.
   * Sesuai dokumen: Anggota bisa 'Read'.pdf, p. 3].
   */
  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // <-- Anggota & Pengurus bisa lihat
  @ApiOperation({
    summary: 'Mendapatkan detail satu saran anggota (Anggota & Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID Saran Anggota (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.memberSuggestionService.findOne(id);
  }

  /**
   * Endpoint HANYA untuk Pengurus (memberi tanggapan).
   * Sesuai dokumen: Pengurus punya 'CRUD' (Update).pdf, p. 3].
   */
  @Post(':id/respond') // <-- Gunakan POST untuk aksi
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Menambahkan tanggapan pengurus (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Saran Anggota (UUID)' })
  @ApiBody({ type: RespondMemberSuggestionDto }) // <-- Gunakan DTO Respond
  respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() respondDto: RespondMemberSuggestionDto,
    @GetUser() user: JwtPayloadDto, // <-- Ambil info Pengurus
  ) {
    return this.memberSuggestionService.respond(id, respondDto, user);
  }

  /**
   * Endpoint HANYA untuk Pengurus (mengubah saran asli).
   * Sesuai dokumen: Pengurus punya 'CRUD' (Update).pdf, p. 3].
   */
  @Patch(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({ summary: 'Memperbarui isi saran anggota (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Saran Anggota (UUID)' })
  @ApiBody({ type: UpdateMemberSuggestionDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMemberSuggestionDto,
  ) {
    return this.memberSuggestionService.update(id, updateDto);
  }

  /**
   * Endpoint HANYA untuk Pengurus.
   * Sesuai dokumen: Pengurus punya 'CRUD' (Delete).pdf, p. 3].
   */
  @Delete(':id')
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus saran anggota (Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID Saran Anggota (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.memberSuggestionService.remove(id);
  }
}
