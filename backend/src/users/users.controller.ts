// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards, // <-- Impor
  ParseUUIDPipe, // <-- Impor
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'; // <-- Impor
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard'; // <-- Impor
import { RolesGuard } from 'src/auth/guards/roles.guard'; // <-- Impor
import { Roles } from 'src/auth/decorators/roles.decorator'; // <-- Impor
import { Role } from 'src/auth/enums/role.enum'; // <-- Impor

@ApiTags('Users') // <-- Tag Swagger
@ApiBearerAuth() // <-- Semua endpoint di sini butuh token
@UseGuards(JwtAuthGuard, RolesGuard) // <-- Terapkan guard di level Controller
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * (Hanya Pengurus) Endpoint untuk membuat akun login bagi
   * anggota yang didaftar manual (via POST /members)
   */
  @Post()
  @Roles(Role.Pengurus) // <-- HANYA Pengurus
  @ApiOperation({
    summary:
      'Membuatkan akun login (User) untuk Anggota (Member) yang sudah ada',
  })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  // Endpoint lain bisa Anda aktifkan nanti jika perlu
  @Get()
  @Roles(Role.Pengurus) // Amankan juga
  @ApiOperation({ summary: 'Mendapatkan semua akun user (Pengurus)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Pengurus) // Amankan juga
  @ApiOperation({ summary: 'Mendapatkan detail akun user (Pengurus)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // @Patch(':id')
  // @Roles(Role.Pengurus)
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(id, updateUserDto);
  // }

  @Delete(':id')
  @Roles(Role.Pengurus) // Amankan juga
  @ApiOperation({ summary: 'Menghapus akun user (Pengurus)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
