import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PublicService } from './public.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerTenantDto: RegisterTenantDto) {
    return this.publicService.register(registerTenantDto);
  }
}
