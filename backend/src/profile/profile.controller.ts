// src/profile/profile.controller.ts
import {
  Controller,
  UseGuards,
  Get,
  Patch, // <-- Tambahkan Patch
  Body, // <-- Tambahkan Body
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  ApiBearerAuth,
  ApiBody, // <-- Tambahkan ApiBody
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { UpdateMyProfileDto } from './dto/update-profile.dto';

@ApiTags('User Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Mendapatkan data profil lengkap pengguna yang login',
  })
  getMyProfile(@GetUser() user: JwtPayloadDto) {
    return this.profileService.getMyProfile(user.userId);
  }

  /**
   * (BARU) Endpoint untuk memperbarui data profil
   * (Nama, Alamat, Pekerjaan) milik pengguna yang sedang login.
   */
  @Patch('me')
  @ApiOperation({
    summary: 'Memperbarui data profil pengguna yang login',
  })
  @ApiBody({ type: UpdateMyProfileDto })
  updateMyProfile(
    @GetUser() user: JwtPayloadDto, // Ambil userId dari token
    @Body() updateDto: UpdateMyProfileDto, // Ambil data baru dari body
  ) {
    return this.profileService.updateMyProfile(user.userId, updateDto);
  }
}
