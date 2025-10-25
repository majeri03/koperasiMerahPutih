// src/email/email.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromAddress: string;
  private readonly logger = new Logger(EmailService.name); // Untuk logging

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.fromAddress =
      this.configService.getOrThrow<string>('EMAIL_FROM_ADDRESS');
    this.resend = new Resend(apiKey);
    this.logger.log('EmailService initialized');
  }

  /**
   * Mengirim email menggunakan Resend.
   * @param to Alamat email tujuan
   * @param subject Judul email
   * @param htmlBody Konten email dalam format HTML
   * @param senderName Nama pengirim yang ditampilkan (opsional, contoh: "Koperasi Maju Jaya")
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    senderName?: string, // Tambahkan parameter opsional untuk nama pengirim
  ): Promise<void> {
    const from = senderName
      ? `${senderName} <${this.fromAddress}>` // Format: "Nama Pengirim <email@domain.com>"
      : this.fromAddress;

    try {
      const { data, error } = await this.resend.emails.send({
        from: from,
        to: [to], // Resend menerima array untuk 'to'
        subject: subject,
        html: htmlBody,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        throw new InternalServerErrorException('Gagal mengirim email.');
      }

      this.logger.log(`Email sent successfully to ${to}, ID: ${data?.id}`);
    } catch (err) {
      // Tangkap error lain jika terjadi sebelum request (misal konfigurasi salah)
      this.logger.error(`Error sending email to ${to}:`, err);
      // Hindari melempar error InternalServer ke user jika tidak perlu
      // throw new InternalServerErrorException('Gagal mengirim email.');
      // Cukup log error di backend, kecuali jika pengiriman email sangat kritikal
      // dan proses lain harus dihentikan jika gagal. Untuk notifikasi/reset, log saja cukup.
    }
  }

  // --- Kita akan tambahkan method spesifik (sendPasswordResetEmail, dll.) di sini nanti ---

  /**
   * Contoh implementasi template sederhana untuk email reset password.
   * @param name Nama penerima
   * @param resetLink Link untuk reset password
   * @returns String HTML untuk body email
   */
  createPasswordResetHtml(name: string, resetLink: string): string {
    // Anda bisa menggunakan library templating (Handlebars, EJS) untuk HTML yang lebih kompleks
    return `
      <p>Halo ${name},</p>
      <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda.</p>
      <p>Silakan klik link di bawah ini untuk melanjutkan:</p>
      <p><a href="${resetLink}" target="_blank">Reset Password Saya</a></p>
      <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
      <p>Jika Anda tidak merasa meminta reset password, abaikan email ini.</p>
      <br>
      <p>Terima kasih,</p>
      <p>Tim Platform Koperasi</p> 
    `; // Ganti "Tim Platform Koperasi" sesuai nama platform Anda
  }
}
