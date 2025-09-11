import { Module, forwardRef } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { TenantsModule } from 'src/tenants/tenants.module';
@Module({
  imports: [forwardRef(() => TenantsModule)],
  providers: [MidtransService],
  exports: [MidtransService],
})
export class MidtransModule {}
