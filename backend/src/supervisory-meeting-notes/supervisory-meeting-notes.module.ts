import { Module } from '@nestjs/common';
import { SupervisoryMeetingNotesService } from './supervisory-meeting-notes.service';
import { SupervisoryMeetingNotesController } from './supervisory-meeting-notes.controller';

@Module({
  controllers: [SupervisoryMeetingNotesController],
  providers: [SupervisoryMeetingNotesService],
})
export class SupervisoryMeetingNotesModule {}
