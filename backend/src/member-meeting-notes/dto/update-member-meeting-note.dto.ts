// backend/src/member-meeting-notes/dto/update-member-meeting-note.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMemberMeetingNoteDto } from './create-member-meeting-note.dto';

// Update DTO hanya perlu mengextend PartialType dari Create DTO
export class UpdateMemberMeetingNoteDto extends PartialType(
  CreateMemberMeetingNoteDto,
) {}
