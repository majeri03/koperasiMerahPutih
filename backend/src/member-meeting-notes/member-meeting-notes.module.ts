import { Module } from '@nestjs/common';
import { MemberMeetingNotesService } from './member-meeting-notes.service';
import { MemberMeetingNotesController } from './member-meeting-notes.controller';

@Module({
  controllers: [MemberMeetingNotesController],
  providers: [MemberMeetingNotesService],
})
export class MemberMeetingNotesModule {}
