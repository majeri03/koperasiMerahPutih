import { Module } from '@nestjs/common';
import { GuestBookService } from './guest-book.service';
import { GuestBookController } from './guest-book.controller';

@Module({
  controllers: [GuestBookController],
  providers: [GuestBookService],
})
export class GuestBookModule {}
