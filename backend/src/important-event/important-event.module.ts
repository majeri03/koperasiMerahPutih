import { Module } from '@nestjs/common';
import { ImportantEventService } from './important-event.service';
import { ImportantEventController } from './important-event.controller';

@Module({
  controllers: [ImportantEventController],
  providers: [ImportantEventService],
})
export class ImportantEventModule {}
