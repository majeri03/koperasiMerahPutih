import { PartialType } from '@nestjs/swagger';
import { CreateBoardMeetingNoteDto } from './create-board-meeting-note.dto';

export class UpdateBoardMeetingNoteDto extends PartialType(
  CreateBoardMeetingNoteDto,
) {}
