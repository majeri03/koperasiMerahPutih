import { PartialType } from '@nestjs/swagger';
import { CreateImportantEventDto } from './create-important-event.dto';

export class UpdateImportantEventDto extends PartialType(CreateImportantEventDto) {}
