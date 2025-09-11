import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { MidtransModule } from 'src/midtrans/midtrans.module';
@Module({
  imports: [MidtransModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
