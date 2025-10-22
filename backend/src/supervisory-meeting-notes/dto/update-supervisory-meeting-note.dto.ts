// backend/src/supervisory-meeting-notes/dto/update-supervisory-meeting-note.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSupervisoryMeetingNoteDto } from './create-supervisory-meeting-note.dto';

export class UpdateSupervisoryMeetingNoteDto extends PartialType(
  CreateSupervisoryMeetingNoteDto,
) {}
