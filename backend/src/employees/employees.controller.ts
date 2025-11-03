// backend/src/employees/employees.controller.ts
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
  Query, // Impor Query jika ingin menerima alasan berhenti dari body Delete
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiQuery, // Impor ApiQuery
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
@ApiTags('Employees (Buku 10)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Membuat data karyawan baru' })
  @ApiBody({ type: CreateEmployeeDto })
  create(@Body() createDto: CreateEmployeeDto) {
    return this.employeesService.create(createDto);
  }

  @Get()
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Mendapatkan daftar semua karyawan' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Mendapatkan detail satu karyawan berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Memperbarui data karyawan' })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)', type: String })
  @ApiBody({ type: UpdateEmployeeDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Memberhentikan karyawan (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)', type: String })
  @ApiQuery({
    name: 'reason',
    description: 'Alasan pemberhentian (opsional)',
    required: false,
    type: String,
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string, // Ambil reason dari query parameter
  ) {
    // Jika reason tidak ada, service akan menggunakan default 'Diberhentikan'
    return this.employeesService.remove(id, reason);
  }

  // --- Endpoint Approval Pengurus ---
  @Patch(':id/approve-pengurus')
  @Roles(Role.Pengurus)
  @ApiOperation({ summary: 'Set persetujuan pengurus untuk data karyawan' })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)', type: String })
  approveByPengurus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.employeesService.approveByPengurus(id, user.userId);
  }

  // --- Endpoint Approval Ketua ---
  @Patch(':id/approve-ketua')
  // Pastikan Role 'Ketua' ada atau sesuaikan @Roles() jika Ketua memiliki role 'Pengurus'
  @Roles(Role.Pengurus) // Ganti ke Role.Ketua jika ada role terpisah
  @UseGuards(JabatanGuard)
  @Jabatan(JabatanPengurus.Ketua)
  @ApiOperation({ summary: 'Set persetujuan ketua untuk data karyawan' })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)', type: String })
  approveByKetua(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayloadDto,
  ) {
    // Pertimbangkan menambahkan Guard khusus untuk memastikan user adalah Ketua, jika diperlukan
    return this.employeesService.approveByKetua(id, user.userId);
  }
}
