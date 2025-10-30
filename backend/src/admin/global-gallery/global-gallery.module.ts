import { Module } from '@nestjs/common';
import { GlobalGalleryController } from './global-gallery.controller';
import { GlobalGalleryService } from './global-gallery.service';

@Module({
  controllers: [GlobalGalleryController],
  providers: [GlobalGalleryService]
})
export class GlobalGalleryModule {}
