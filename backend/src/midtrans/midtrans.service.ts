/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  InternalServerErrorException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';
import { TenantsService } from 'src/tenants/tenants.service';

interface MidtransTransactionResponse {
  token: string;
  redirect_url: string;
}

@Injectable()
export class MidtransService {
  private snap: midtransClient.Snap;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => TenantsService))
    private tenantsService: TenantsService,
  ) {
    this.snap = new midtransClient.Snap({
      isProduction: configService.get('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: configService.get<string>('MIDTRANS_SERVER_KEY'),
      clientKey: configService.get<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createTransaction(
    tenantId: string,
    amount: number,
    customerDetails: { firstName: string; email: string },
  ): Promise<MidtransTransactionResponse> {
    const orderId = tenantId;
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerDetails.firstName,
        email: customerDetails.email,
      },
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      return transaction;
    } catch (error) {
      console.error('Midtrans transaction creation failed:', error);
      throw new InternalServerErrorException(
        'Gagal membuat transaksi pembayaran.',
      );
    }
  }
  async handlePaymentNotification(notificationPayload: any) {
    // 1. Verifikasi notifikasi menggunakan library Midtrans
    const notification =
      await this.snap.transaction.notification(notificationPayload);

    // 2. Ekstrak informasi penting
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(
      `Webhook diterima untuk Order ID: ${orderId}, Status: ${transactionStatus}`,
    );

    // 3. Logika untuk aktivasi tenant
    if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
      if (fraudStatus == 'accept') {
        // Pembayaran berhasil dan aman
        // Ekstrak tenantId dari orderId
        const tenantId = orderId;

        // Panggil service untuk mengaktifkan tenant
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.tenantsService.activateTenant(tenantId);
      }
    }

    // Penting: Kembalikan respons sukses agar Midtrans tidak mengirim ulang notifikasi
    return { status: 'ok' };
  }
}
