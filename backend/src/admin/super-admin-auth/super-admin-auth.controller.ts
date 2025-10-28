// src/admin/super-admin-auth/super-admin-auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { AuthGuard } from '@nestjs/passport'; // <-- Import AuthGuard
import { GetUser } from 'src/auth/get-user.decorator'; // <-- Import GetUser (bisa direuse)
import { SuperAdminRefreshTokenPayloadDto } from './dto/super-admin-jwt-payload.dto';

@ApiTags('Admin - Super Admin Authentication') // Tag Swagger khusus
@Controller('admin/auth') // Prefix route '/admin/auth'
export class SuperAdminAuthController {
  constructor(private readonly superAdminAuthService: SuperAdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login for Super Admin' })
  @ApiBody({ type: SuperAdminLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access token.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@Body() loginDto: SuperAdminLoginDto) {
    return this.superAdminAuthService.login(loginDto);
  }

  // --- TAMBAHKAN ENDPOINT BARU DI BAWAH INI ---
  @Post('refresh')
  @UseGuards(AuthGuard('superadmin-jwt-refresh')) // Gunakan guard dengan nama strategi refresh
  @ApiBearerAuth('superadmin-jwt') // Skema Bearer Auth khusus refresh (opsional, bisa sama)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Super Admin access token using refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'Access Denied (token mismatch/user invalid).',
  })
  refreshToken(@GetUser() user: SuperAdminRefreshTokenPayloadDto) {
    // Gunakan DTO refresh payload
    // User object akan berisi payload dari SuperAdminRefreshTokenStrategy
    return this.superAdminAuthService.refreshToken(user);
  }
}
