import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { RefreshTokenGuard } from './refresh-token/refresh-token.guard';
import { RefreshTokenPayloadDto } from './dto/refresh-token-payload.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // BENAR: Endpoint ini dijaga oleh JwtAuthGuard (memerlukan Access Token)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@GetUser() user: JwtPayloadDto) {
    return user;
  }

  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Post('refresh')
  refreshToken(@GetUser() user: RefreshTokenPayloadDto) {
    return this.authService.refreshToken(user.userId, user.refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard) // <-- Lindungi endpoint
  @ApiBearerAuth() // <-- Tanda butuh token
  @ApiOperation({ summary: 'Mengubah password user yang sedang login' })
  @ApiBody({ type: ChangePasswordDto }) // <-- Definisikan body
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: JwtPayloadDto, // <-- Ambil info user dari token
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
