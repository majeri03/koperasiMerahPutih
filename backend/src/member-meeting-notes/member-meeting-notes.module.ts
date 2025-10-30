import { Module } from '@nestjs/common';
import { MemberMeetingNotesService } from './member-meeting-notes.service';
import { MemberMeetingNotesController } from './member-meeting-notes.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
@Module({
  imports: [UploadsModule],
  controllers: [MemberMeetingNotesController],
  providers: [MemberMeetingNotesService],
})
export class MemberMeetingNotesModule {}
