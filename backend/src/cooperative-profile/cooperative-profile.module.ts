import { Module } from '@nestjs/common';
import { CooperativeProfileService } from './cooperative-profile.service';
import { CooperativeProfileController } from './cooperative-profile.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
@Module({
  imports: [UploadsModule],
  controllers: [CooperativeProfileController],
  providers: [CooperativeProfileService],
})
export class CooperativeProfileModule {}
