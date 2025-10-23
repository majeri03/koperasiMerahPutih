import { PartialType } from '@nestjs/swagger';
import { CreateOfficialRecommendationDto } from './create-official-recommendation.dto';

export class UpdateOfficialRecommendationDto extends PartialType(
  CreateOfficialRecommendationDto,
) {}
