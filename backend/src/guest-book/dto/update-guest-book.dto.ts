import { PartialType } from '@nestjs/swagger';
import { CreateGuestBookDto } from './create-guest-book.dto';

export class UpdateGuestBookDto extends PartialType(CreateGuestBookDto) {}
