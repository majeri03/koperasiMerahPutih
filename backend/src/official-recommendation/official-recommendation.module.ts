import { Module } from '@nestjs/common';
import { OfficialRecommendationService } from './official-recommendation.service';
import { OfficialRecommendationController } from './official-recommendation.controller';

@Module({
  controllers: [OfficialRecommendationController],
  providers: [OfficialRecommendationService],
})
export class OfficialRecommendationModule {}
