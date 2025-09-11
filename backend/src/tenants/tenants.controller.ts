import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { SuperAdminGuard } from '../admin/super-admin/super-admin.guard';

@UseGuards(SuperAdminGuard)
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
  approve(@Param('id') id: string) {
    return this.tenantsService.approve(id);
  }
}
