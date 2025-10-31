// backend/src/supervisory-positions/supervisory-positions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SupervisoryPositionsService } from './supervisory-positions.service';
import { CreateSupervisoryPositionDto } from './dto/create-supervisory-position.dto';
import { UpdateSupervisoryPositionDto } from './dto/update-supervisory-position.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard'; // Sesuaikan path jika perlu
import { RolesGuard } from 'src/auth/guards/roles.guard'; // Sesuaikan path jika perlu
import { Roles } from 'src/auth/decorators/roles.decorator'; // Sesuaikan path jika perlu
import { Role } from 'src/auth/enums/role.enum'; // Sesuaikan path jika perlu

@ApiTags('Supervisory Positions (Buku 03)') // Tag untuk Swagger UI
@ApiBearerAuth() // Membutuhkan Bearer Token
@UseGuards(JwtAuthGuard, RolesGuard) // Terapkan guard autentikasi dan otorisasi
@Controller('supervisory-positions')
export class SupervisoryPositionsController {
  constructor(
    private readonly supervisoryPositionsService: SupervisoryPositionsService,
  ) {}

  @Post()
  @Roles(Role.Pengurus) // Hanya Pengurus boleh create
  @ApiOperation({ summary: 'Membuat data posisi pengawas baru' })
  @ApiBody({ type: CreateSupervisoryPositionDto })
  create(@Body() createDto: CreateSupervisoryPositionDto) {
    // Panggil service untuk membuat data
    return this.supervisoryPositionsService.create(createDto);
  }

  @Get()
  @Roles(Role.Pengurus, Role.Anggota, Role.Pengawas) // Pengurus & Anggota boleh lihat semua
  @ApiOperation({ summary: 'Mendapatkan semua data posisi pengawas' })
  findAll() {
    // Panggil service untuk mendapatkan semua data
    return this.supervisoryPositionsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus, Role.Anggota) // Pengurus & Anggota boleh lihat detail
  @ApiOperation({
    summary: 'Mendapatkan detail satu posisi pengawas berdasarkan ID',
  })
  @ApiParam({ name: 'id', description: 'ID Posisi Pengawas', type: String })
  findOne(@Param('id') id: string) {
    // Panggil service untuk mendapatkan satu data berdasarkan ID
    return this.supervisoryPositionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus boleh update
  @ApiOperation({ summary: 'Memperbarui data posisi pengawas' })
  @ApiParam({ name: 'id', description: 'ID Posisi Pengawas', type: String })
  @ApiBody({ type: UpdateSupervisoryPositionDto })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSupervisoryPositionDto,
  ) {
    // Panggil service untuk memperbarui data
    return this.supervisoryPositionsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus boleh menonaktifkan (soft delete)
  @ApiOperation({ summary: 'Menonaktifkan posisi pengawas (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID Posisi Pengawas', type: String })
  remove(@Param('id') id: string) {
    // Panggil service untuk menonaktifkan (soft delete)
    // Anda bisa menambahkan @Body jika ingin menerima alasan pemberhentian
    return this.supervisoryPositionsService.remove(id);
  }
}
