import { PartialType } from '@nestjs/swagger';
import { CreateMemberRegistrationDto } from './create-member-registration.dto';

export class UpdateMemberRegistrationDto extends PartialType(CreateMemberRegistrationDto) {}
