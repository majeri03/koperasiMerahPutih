import { PartialType } from '@nestjs/swagger';
import { CreateMemberSuggestionDto } from './create-member-suggestion.dto';

export class UpdateMemberSuggestionDto extends PartialType(
  CreateMemberSuggestionDto,
) {}
