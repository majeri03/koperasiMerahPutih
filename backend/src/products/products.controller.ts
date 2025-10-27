// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  ParseBoolPipe, // <-- Tambah ParseBoolPipe
} from '@nestjs/common';
import { ProductsService, PaginatedProductsResult } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

// Konstanta validasi gambar
const MAX_IMAGE_SIZE_MB = 2; // Ukuran disesuaikan untuk produk
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = /(jpg|jpeg|png|webp)$/;

@ApiTags('Products (Katalog)')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * (Pengurus) Create new product.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Membuat produk baru (Hanya Pengurus)' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * (Publik) Get AVAILABLE products list (paginated, filtered by category).
   */
  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar produk tersedia (Publik)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category slug',
  })
  findAllAvailable(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') categorySlug?: string,
  ): Promise<PaginatedProductsResult> {
    return this.productsService.findAllAvailable(page, limit, categorySlug);
  }

  /**
   * (Pengurus) Get ALL products list (paginated, filtered by category/status).
   */
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mendapatkan SEMUA produk (termasuk non-aktif) (Hanya Pengurus)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category slug',
  })
  @ApiQuery({
    name: 'available',
    required: false,
    type: Boolean,
    description: 'Filter by availability (true/false)',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') categorySlug?: string,
    // Gunakan ParseBoolPipe untuk konversi 'true'/'false' dari query string
    @Query('available', new ParseBoolPipe({ optional: true }))
    isAvailable?: boolean,
  ) {
    return this.productsService.findAll(page, limit, categorySlug, isAvailable);
  }

  /**
   * (Publik) Get AVAILABLE product detail by slug.
   */
  @Get(':slug')
  @ApiOperation({
    summary: 'Mendapatkan detail produk tersedia by slug (Publik)',
  })
  @ApiParam({ name: 'slug', description: 'Slug unik produk' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  /**
   * (Pengurus) Get product detail by ID (for editing).
   */
  @Get('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Mendapatkan detail produk by ID (termasuk non-aktif) (Hanya Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID unik produk (UUID)' })
  findOneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOneById(id);
  }

  /**
   * (Pengurus) Update product by ID.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Memperbarui produk (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik produk (UUID)' })
  @ApiBody({ type: UpdateProductDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    // Note: service.update tidak butuh user saat ini, tapi bisa ditambahkan jika perlu log pengedit
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * (Pengurus) Delete product by ID.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Menghapus produk (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik produk (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }

  /**
   * (Pengurus) Upload/Update product image.
   */
  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload/Ganti gambar produk (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik produk (UUID)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES }),
          new FileTypeValidator({ fileType: ALLOWED_IMAGE_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productsService.updateImage(id, file);
  }
}
