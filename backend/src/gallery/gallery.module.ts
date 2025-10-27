import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
@Module({
  imports: [UploadsModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
