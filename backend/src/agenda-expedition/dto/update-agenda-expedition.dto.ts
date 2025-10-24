import { PartialType } from '@nestjs/swagger';
import { CreateAgendaExpeditionDto } from './create-agenda-expedition.dto';

export class UpdateAgendaExpeditionDto extends PartialType(CreateAgendaExpeditionDto) {}
