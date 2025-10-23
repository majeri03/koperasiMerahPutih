import { Module } from '@nestjs/common';
import { SupervisorySuggestionService } from './supervisory-suggestion.service';
import { SupervisorySuggestionController } from './supervisory-suggestion.controller';

@Module({
  controllers: [SupervisorySuggestionController],
  providers: [SupervisorySuggestionService],
})
export class SupervisorySuggestionModule {}
