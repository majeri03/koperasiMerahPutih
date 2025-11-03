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
  Query,
} from '@nestjs/common';
import { BoardPositionsService } from './board-positions.service';
import { CreateBoardPositionDto } from './dto/create-board-position.dto';
import { UpdateBoardPositionDto } from './dto/update-board-position.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { JabatanGuard } from 'src/auth/guards/jabatan.guard';
import { Jabatan } from 'src/auth/decorators/jabatan.decorator';
import { JabatanPengurus } from 'src/auth/enums/jabatan-pengurus.enum';
@ApiTags('Board Positions (Buku 02)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('board-positions')
export class BoardPositionsController {
  constructor(private readonly boardPositionsService: BoardPositionsService) {}

  @Post()
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Ketua) // Hanya Pengurus boleh create
  @ApiOperation({ summary: 'Membuat data posisi pengurus baru' })
  @ApiBody({ type: CreateBoardPositionDto })
  create(@Body() createBoardPositionDto: CreateBoardPositionDto) {
    return this.boardPositionsService.create(createBoardPositionDto);
  }

  @Get()
  @Roles(Role.Pengurus, Role.Anggota) // Pengurus & Anggota boleh read all
  @ApiOperation({ summary: 'Mendapatkan semua data posisi pengurus' })
  findAll() {
    return this.boardPositionsService.findAll();
  }

  @Get('me') // Endpoint baru: /board-positions/me
  @Roles(Role.Pengurus) // Hanya bisa diakses oleh Pengurus
  @ApiOperation({
    summary: 'Mendapatkan jabatan pengurus aktif milik pengguna yang login',
  })
  @ApiResponse({ status: 200, description: 'Jabatan aktif berhasil diambil.' })
  @ApiResponse({ status: 403, description: 'Akses ditolak (bukan Pengurus).' })
  findMyActivePositions(@GetUser() user: JwtPayloadDto) {
    // Panggil service dengan userId (yang sama dengan memberId)
    return this.boardPositionsService.findMyActivePositions(user.userId);
  }

  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // Pengurus & Anggota boleh read one
  @ApiOperation({
    summary: 'Mendapatkan detail satu posisi pengurus berdasarkan ID',
  })
  @ApiParam({ name: 'id', description: 'ID Posisi Pengurus', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.boardPositionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus boleh update
  @ApiOperation({ summary: 'Memperbarui data posisi pengurus' })
  @ApiParam({ name: 'id', description: 'ID Posisi Pengurus', type: String })
  @ApiBody({ type: UpdateBoardPositionDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBoardPositionDto: UpdateBoardPositionDto,
  ) {
    return this.boardPositionsService.update(id, updateBoardPositionDto);
  }

  @Delete(':id')
  @UseGuards(JabatanGuard)
  @Roles(Role.Pengurus)
  @Jabatan(JabatanPengurus.Ketua, JabatanPengurus.Sekretaris)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Menonaktifkan posisi pengurus (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID Posisi Pengurus', type: String })
  @ApiQuery({
    name: 'reason',
    required: false,
    description: 'Alasan pemberhentian (opsional)',
    type: String,
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
  ) {
    return this.boardPositionsService.remove(id, reason);
  }

  @Patch(':id/approve-termination')
  @Roles(Role.Pengurus) // Idealnya hanya Ketua
  @UseGuards(JabatanGuard) // Aktifkan jika JabatanGuard sudah siap
  @Jabatan(JabatanPengurus.Ketua)
  @ApiOperation({
    summary: '(Ketua) Menyetujui pemberhentian jabatan pengurus',
  })
  @ApiParam({ name: 'id', description: 'ID Posisi Jabatan (UUID)' })
  @HttpCode(HttpStatus.OK)
  approveTermination(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayloadDto, // Ambil ID Ketua dari token
  ) {
    return this.boardPositionsService.approveTermination(id, user.userId);
  }
}
