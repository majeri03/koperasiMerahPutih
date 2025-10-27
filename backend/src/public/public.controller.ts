import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger'; // <-- Tambahkan dekorator Swagger
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerTenantDto: RegisterTenantDto) {
    return this.publicService.register(registerTenantDto);
  }

  @Get('contact-info')
  @ApiOperation({ summary: 'Mengambil informasi kontak publik koperasi' })
  @ApiResponse({
    status: 200,
    description: 'Informasi kontak berhasil diambil.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Profil koperasi tidak ditemukan (tenant salah/tidak aktif/profil belum ada).',
  })
  @ApiResponse({
    status: 500,
    description: 'Gagal mengambil informasi kontak.',
  })
  getContactInfo() {
    // Middleware Tenancy akan menentukan tenant berdasarkan subdomain
    return this.publicService.getContactInfo();
  }

  @Post('contact-message')
  @HttpCode(HttpStatus.OK) // Atau CREATED (201) jika Anda anggap ini membuat resource baru
  @ApiOperation({ summary: 'Mengirim pesan kontak dari publik' })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiResponse({ status: 200, description: 'Pesan berhasil dikirim.' }) // Atau 201
  @ApiResponse({ status: 400, description: 'Data input tidak valid.' })
  @ApiResponse({ status: 500, description: 'Gagal mengirim pesan.' })
  saveContactMessage(@Body() createDto: CreateContactMessageDto) {
    // Middleware Tenancy akan menentukan tenant
    return this.publicService.saveContactMessage(createDto);
  }
}
