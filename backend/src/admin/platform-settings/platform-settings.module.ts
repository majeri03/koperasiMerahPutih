import { Module } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { PlatformSettingsController } from './platform-settings.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [UploadsModule, ConfigModule],
  controllers: [PlatformSettingsController],
  providers: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
