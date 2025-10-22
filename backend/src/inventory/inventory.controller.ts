// backend/src/inventory/inventory.controller.ts
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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard'; // Sesuaikan path
import { RolesGuard } from 'src/auth/guards/roles.guard'; // Sesuaikan path
import { Roles } from 'src/auth/decorators/roles.decorator'; // Sesuaikan path
import { Role } from 'src/auth/enums/role.enum'; // Sesuaikan path

@ApiTags('Inventory (Buku 06)') // Tag Swagger
@ApiBearerAuth() // Membutuhkan token
@UseGuards(JwtAuthGuard, RolesGuard) // Terapkan guard auth & roles
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.Pengurus) // Hanya Pengurus (Sekretaris sesuai PDF)
  @ApiOperation({ summary: 'Membuat data item inventaris baru' })
  @ApiBody({ type: CreateInventoryDto })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    // Service akan menghitung totalValue & generate itemCode
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  // Pengurus bisa lihat semua. Anggota & Tamu? Sesuai PDF, Tamu bisa lihat read-only* via landing page.
  // Untuk API internal, kita batasi ke Pengurus dulu, atau perlu filter role.
  @Roles(Role.Pengurus) // Sementara batasi ke Pengurus untuk API internal
  @ApiOperation({
    summary: 'Mendapatkan daftar semua item inventaris (Pengurus)',
  })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus) // Sementara batasi ke Pengurus untuk API internal
  @ApiOperation({
    summary: 'Mendapatkan detail satu item inventaris berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Item Inventaris (UUID)',
    type: String,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus (Sekretaris)
  @ApiOperation({ summary: 'Memperbarui data item inventaris' })
  @ApiParam({
    name: 'id',
    description: 'ID Item Inventaris (UUID)',
    type: String,
  })
  @ApiBody({ type: UpdateInventoryDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    // Service akan menghitung ulang totalValue jika perlu
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @Roles(Role.Pengurus) // Hanya Pengurus (Sekretaris)
  @HttpCode(HttpStatus.NO_CONTENT) // Status 204 jika berhasil hapus
  @ApiOperation({ summary: 'Menghapus data item inventaris' })
  @ApiParam({
    name: 'id',
    description: 'ID Item Inventaris (UUID)',
    type: String,
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.inventoryService.remove(id);
    // Tidak return body
  }
}
