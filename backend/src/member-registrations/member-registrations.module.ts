import { Module } from '@nestjs/common';
import { MemberRegistrationsService } from './member-registrations.service';
import { MemberRegistrationsController } from './member-registrations.controller';

@Module({
  controllers: [MemberRegistrationsController],
  providers: [MemberRegistrationsService],
})
export class MemberRegistrationsModule {}
