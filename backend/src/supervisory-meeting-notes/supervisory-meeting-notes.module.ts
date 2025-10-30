import { Module } from '@nestjs/common';
import { SupervisoryMeetingNotesService } from './supervisory-meeting-notes.service';
import { SupervisoryMeetingNotesController } from './supervisory-meeting-notes.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
@Module({
  imports: [UploadsModule],
  controllers: [SupervisoryMeetingNotesController],
  providers: [SupervisoryMeetingNotesService],
})
export class SupervisoryMeetingNotesModule {}
