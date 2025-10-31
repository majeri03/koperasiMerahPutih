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
  private readonly frontendDomain: string;
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.fromAddress =
      this.configService.getOrThrow<string>('EMAIL_FROM_ADDRESS');
    this.frontendDomain = this.configService.get<string>(
      'FRONTEND_DOMAIN',
      'localhost:3000',
    );
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

  /**
   * Membuat HTML untuk notifikasi tenant (koperasi) disetujui.
   */
  createTenantApprovedHtml(
    picName: string,
    tenantName: string,
    subdomain: string,
  ): string {
    const loginUrl = `http://${subdomain}.${this.frontendDomain}`;
    return `
      <p>Halo ${picName},</p>
      <p>Kabar baik! Pendaftaran koperasi Anda, <b>${tenantName}</b>, telah disetujui.</p>
      <p>Anda sekarang dapat mengakses platform koperasi Anda melalui link di bawah ini:</p>
      <p><a href="${loginUrl}" target="_blank">${loginUrl}</a></p>
      <p>Silakan login menggunakan email dan password yang telah Anda daftarkan.</p>
      <br>
      <p>Terima kasih,</p>
      <p>Tim Platform Koperasi</p>
    `;
  }

  /**
   * Membuat HTML untuk notifikasi tenant (koperasi) ditolak.
   */
  createTenantRejectedHtml(
    picName: string,
    tenantName: string,
    reason: string,
  ): string {
    return `
      <p>Halo ${picName},</p>
      <p>Setelah peninjauan, kami informasikan bahwa pendaftaran koperasi Anda, <b>${tenantName}</b>, belum dapat kami setujui saat ini.</p>
      <p><b>Alasan Penolakan:</b> ${reason}</p>
      <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi tim support kami.</p>
      <br>
      <p>Terima kasih,</p>
      <p>Tim Platform Koperasi</p>
    `;
  }

  /**
   * Membuat HTML untuk notifikasi pendaftaran anggota disetujui.
   */
  createMemberApprovedHtml(
    memberName: string,
    cooperativeName: string,
    subdomain: string,
  ): string {
    const loginUrl = `http://${subdomain}.${this.frontendDomain}`;
    return `
      <p>Halo ${memberName},</p>
      <p>Selamat! Pendaftaran Anda sebagai anggota <b>${cooperativeName}</b> telah disetujui oleh Pengurus.</p>
      <p>Anda sekarang dapat login ke akun Anda melalui link di bawah ini:</p>
      <p><a href="${loginUrl}" target="_blank">${loginUrl}</a></p>
      <p>Silakan login menggunakan email dan password yang telah Anda daftarkan.</p>
      <br>
      <p>Terima kasih,</p>
      <p>Pengurus ${cooperativeName}</p>
    `;
  }

  /**
   * Membuat HTML untuk notifikasi pendaftaran anggota ditolak.
   */
  createMemberRejectedHtml(
    memberName: string,
    cooperativeName: string,
    reason: string,
  ): string {
    return `
      <p>Halo ${memberName},</p>
      <p>Setelah peninjauan oleh Pengurus, kami informasikan bahwa pendaftaran Anda sebagai anggota <b>${cooperativeName}</b> belum dapat disetujui saat ini.</p>
      <p><b>Alasan Penolakan:</b> ${reason}</p>
      <p>Silakan hubungi Pengurus koperasi Anda secara langsung untuk informasi lebih lanjut.</p>
      <br>
      <p>Terima kasih,</p>
      <p>Pengurus ${cooperativeName}</p>
    `;
  }

  /**
   * Membuat HTML untuk notifikasi akun yang dibuat manual oleh Admin.
   * @param memberName Nama anggota
   * @param cooperativeName Nama koperasi
   * @param subdomain Subdomain (tenantId) untuk link login
   * @param loginEmail Email yang didaftarkan
   * @param loginPassword Password plaintext yang baru dibuat
   */
  createManualAccountHtml(
    memberName: string,
    cooperativeName: string,
    subdomain: string,
    loginEmail: string,
    loginPassword: string, // Kita kirim password plaintext di sini
  ): string {
    // Dapatkan domain frontend dari config, default ke 'localhost:3000'
    const loginUrl = `http://${subdomain}.${this.frontendDomain}`;

    return `
      <p>Halo ${memberName},</p>
      <p>Pengurus <b>${cooperativeName}</b> telah berhasil membuatkan akun login untuk Anda di platform koperasi.</p>
      <p>Anda sekarang dapat login ke akun Anda menggunakan detail berikut:</p>
      
      <p><b>Link Login:</b> <a href="${loginUrl}" target="_blank">${loginUrl}</a></p>
      <p><b>Email:</b> ${loginEmail}</p>
      <p><b>Password:</b> ${loginPassword}</p>
      <br>
      <p>Kami sangat menyarankan Anda untuk segera login dan mengubah password Anda melalui menu "Ganti Password" di profil Anda.</p>
      <br>
      <p>Terima kasih,</p>
      <p>Pengurus ${cooperativeName}</p>
    `;
  }
}
