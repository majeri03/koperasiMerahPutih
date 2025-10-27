// src/product-categories/product-categories.controller.ts
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
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
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

@ApiTags('Product Categories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  /**
   * (Pengurus) Membuat kategori produk baru.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Membuat kategori produk baru (Hanya Pengurus)' })
  @ApiBody({ type: CreateProductCategoryDto })
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productCategoriesService.create(createProductCategoryDto);
  }

  /**
   * (Publik/Anggota/Pengurus) Mendapatkan daftar semua kategori produk.
   */
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan daftar semua kategori produk (Publik)',
  })
  findAll() {
    // Endpoint ini publik, tidak memerlukan guard
    return this.productCategoriesService.findAll();
  }

  /**
   * (Pengurus) Mendapatkan detail satu kategori berdasarkan ID.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mendapatkan detail kategori by ID (Hanya Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID unik kategori (UUID)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productCategoriesService.findOne(id);
  }

  /**
   * (Pengurus) Memperbarui nama kategori produk.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Memperbarui nama kategori (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik kategori (UUID)' })
  @ApiBody({ type: UpdateProductCategoryDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    return this.productCategoriesService.update(id, updateProductCategoryDto);
  }

  /**
   * (Pengurus) Menghapus kategori produk.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content response
  @ApiOperation({ summary: 'Menghapus kategori (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik kategori (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productCategoriesService.remove(id);
  }
}
