// src/articles/articles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseUUIDPipe,
  UseInterceptors, // <-- Tambah UseInterceptors
  UploadedFile,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe, // <-- Tambah imports file upload
  HttpCode,
  HttpStatus, // <-- Tambah HttpCode, HttpStatus
} from '@nestjs/common';
import { ArticlesService, PaginatedArticlesResult } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger'; // <-- Tambah ApiConsumes
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { ArticleStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express'; // <-- Import FileInterceptor
// Konstanta validasi gambar
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = /(jpg|jpeg|png|webp)$/;

@ApiTags('Articles (Berita & Artikel)')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * (Pengurus) Create new article.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Membuat artikel/berita baru (Hanya Pengurus)' })
  create(
    @Body() createArticleDto: CreateArticleDto,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.articlesService.create(createArticleDto, user);
  }

  /**
   * (Publik) Get published articles list (paginated).
   */
  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar artikel publish (Publik)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Halaman ke-',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Item per halaman',
  })
  findAllPublished(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedArticlesResult> {
    return this.articlesService.findAllPublished(page, limit);
  }

  /**
   * (Pengurus) Get ALL articles list (paginated, filtered).
   */
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mendapatkan SEMUA artikel (termasuk draft) (Hanya Pengurus)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ArticleStatus })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: ArticleStatus,
  ): Promise<PaginatedArticlesResult> {
    return this.articlesService.findAll(page, limit, status);
  }

  /**
   * (Publik) Get published article detail by slug.
   */
  @Get(':slug')
  @ApiOperation({
    summary: 'Mendapatkan detail artikel publish by slug (Publik)',
  })
  @ApiParam({ name: 'slug', description: 'Slug unik artikel' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.articlesService.findOneBySlug(slug);
  }

  /**
   * (Pengurus) Get article detail by ID (for editing).
   */
  @Get('by-id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Mendapatkan detail artikel by ID (termasuk draft) (Hanya Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID unik artikel (UUID)' })
  findOneById(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findOneById(id);
  }

  /**
   * (Pengurus) Update article by ID.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Memperbarui artikel (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik artikel (UUID)' })
  @ApiBody({ type: UpdateArticleDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.articlesService.update(id, updateArticleDto, user);
  }

  /**
   * (Pengurus) Delete article by ID.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content response
  @ApiOperation({ summary: 'Menghapus artikel (Hanya Pengurus)' })
  @ApiParam({ name: 'id', description: 'ID unik artikel (UUID)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.articlesService.remove(id);
  }

  /**
   * (Pengurus) Upload/Update featured image for an article.
   */
  @Post(':id/image') // Gunakan POST untuk upload file
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Pengurus)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file')) // Tangkap file dari key 'file'
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload/Ganti gambar unggulan artikel (Hanya Pengurus)',
  })
  @ApiParam({ name: 'id', description: 'ID unik artikel (UUID)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  updateFeaturedImage(
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
    return this.articlesService.updateFeaturedImage(id, file);
  }
}
