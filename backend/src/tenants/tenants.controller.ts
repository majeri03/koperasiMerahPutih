import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseUUIDPipe, // <-- Import ParseUUIDPipe
  HttpCode, // <-- Import HttpCode
  HttpStatus,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
// import { SuperAdminGuard } from '../admin/super-admin/super-admin.guard';
import { RejectTenantDto } from './dto/reject-tenant.dto'; // <-- Import DTO Baru
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CombinedSuperAdminGuard } from '../admin/super-admin/super-admin.guard';

// @UseGuards(SuperAdminGuard)
@UseGuards(CombinedSuperAdminGuard())
@ApiBearerAuth('superadmin-jwt')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('pending')
  findPending() {
    return this.tenantsService.findPending();
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '(Super Admin) Menyetujui pendaftaran tenant' }) // Tambah deskripsi Swagger
  @ApiParam({ name: 'id', description: 'ID Tenant (UUID)' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    // Tambah ParseUUIDPipe
    return this.tenantsService.approve(id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK) // Status 200 OK jika berhasil tolak
  @ApiOperation({ summary: '(Super Admin) Menolak pendaftaran tenant' })
  @ApiParam({ name: 'id', description: 'ID Tenant (UUID)' })
  @ApiBody({ type: RejectTenantDto })
  reject(
    @Param('id', ParseUUIDPipe) id: string, // Validasi ID
    @Body() rejectDto: RejectTenantDto, // Ambil alasan dari body
  ) {
    return this.tenantsService.rejectTenant(id, rejectDto.reason);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '(Super Admin) Menonaktifkan (suspend) tenant' })
  @ApiParam({ name: 'id', description: 'ID Tenant (UUID)' })
  suspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.suspend(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '(Super Admin) Mengaktifkan kembali tenant' })
  @ApiParam({ name: 'id', description: 'ID Tenant (UUID)' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.activate(id);
  }
}
