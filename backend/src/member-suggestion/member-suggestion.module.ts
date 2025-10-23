import { Module } from '@nestjs/common';
import { MemberSuggestionService } from './member-suggestion.service';
import { MemberSuggestionController } from './member-suggestion.controller';

@Module({
  controllers: [MemberSuggestionController],
  providers: [MemberSuggestionService],
})
export class MemberSuggestionModule {}
