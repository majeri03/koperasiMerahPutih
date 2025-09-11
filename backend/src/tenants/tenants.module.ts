import { Module, forwardRef } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { MidtransModule } from '../midtrans/midtrans.module';
@Module({
  imports: [forwardRef(() => MidtransModule)],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
