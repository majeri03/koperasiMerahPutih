import { Module } from '@nestjs/common';
import { SupervisoryPositionsController } from './supervisory-positions.controller';
import { SupervisoryPositionsService } from './supervisory-positions.service';

@Module({
  controllers: [SupervisoryPositionsController],
  providers: [SupervisoryPositionsService]
})
export class SupervisoryPositionsModule {}
