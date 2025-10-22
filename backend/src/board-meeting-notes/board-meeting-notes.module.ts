import { Module } from '@nestjs/common';
import { BoardMeetingNotesService } from './board-meeting-notes.service';
import { BoardMeetingNotesController } from './board-meeting-notes.controller';

@Module({
  controllers: [BoardMeetingNotesController],
  providers: [BoardMeetingNotesService],
})
export class BoardMeetingNotesModule {}
