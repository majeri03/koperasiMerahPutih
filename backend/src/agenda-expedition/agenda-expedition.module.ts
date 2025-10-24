import { Module } from '@nestjs/common';
import { AgendaExpeditionService } from './agenda-expedition.service';
import { AgendaExpeditionController } from './agenda-expedition.controller';

@Module({
  controllers: [AgendaExpeditionController],
  providers: [AgendaExpeditionService],
})
export class AgendaExpeditionModule {}
