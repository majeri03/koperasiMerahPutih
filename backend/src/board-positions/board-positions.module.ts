import { Module } from '@nestjs/common';
import { BoardPositionsController } from './board-positions.controller';
import { BoardPositionsService } from './board-positions.service';

@Module({
  controllers: [BoardPositionsController],
  providers: [BoardPositionsService],
})
export class BoardPositionsModule {}
