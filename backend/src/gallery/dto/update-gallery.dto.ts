import { PartialType } from '@nestjs/swagger';
import { CreateGalleryItemDto } from './create-gallery.dto';

export class UpdateGalleryItemDto extends PartialType(CreateGalleryItemDto) {}
