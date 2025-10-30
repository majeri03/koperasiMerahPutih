import { Module } from '@nestjs/common';
import { OfficialRecommendationService } from './official-recommendation.service';
import { OfficialRecommendationController } from './official-recommendation.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
@Module({
  imports: [UploadsModule],
  controllers: [OfficialRecommendationController],
  providers: [OfficialRecommendationService],
})
export class OfficialRecommendationModule {}
