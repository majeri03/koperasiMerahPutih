import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MidtransService } from 'src/midtrans/midtrans.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private midtransService: MidtransService) {}

  @Post('midtrans')
  @HttpCode(HttpStatus.OK)
  handleMidtransNotification(@Body() midtransNotificationPayload: any) {
    return this.midtransService.handlePaymentNotification(
      midtransNotificationPayload,
    );
  }
}
