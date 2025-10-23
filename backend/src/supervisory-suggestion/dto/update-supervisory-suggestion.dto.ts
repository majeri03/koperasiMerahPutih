import { PartialType } from '@nestjs/swagger';
import { CreateSupervisorySuggestionDto } from './create-supervisory-suggestion.dto';

export class UpdateSupervisorySuggestionDto extends PartialType(
  CreateSupervisorySuggestionDto,
) {}
