// src/uploads/uploads.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
// Pastikan @types/multer sudah terinstall

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly s3Endpoint: string;
  private readonly publicUrlBase?: string;
  private readonly logger = new Logger(UploadsService.name);
  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    this.s3Endpoint = this.configService.getOrThrow<string>('R2_S3_ENDPOINT');
    const accessKeyId =
      this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.publicUrlBase = this.configService.get<string>('R2_PUBLIC_URL');

    const region = 'auto';

    this.s3Client = new S3Client({
      endpoint: this.s3Endpoint,
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: false,
    });

    console.log(
      `[UploadsService] Initialized for R2 bucket: ${this.bucketName} at endpoint: ${this.s3Endpoint}`,
    );
  }

  /**
   * Mengunggah file ke Cloudflare R2.
   * @param file File yang diterima dari controller (tipe Express.Multer.File) <-- Pastikan tipe ini dikenali setelah install @types/multer
   * @param folder Path folder di dalam bucket R2 (contoh: 'tenant-registrations/pengesahan')
   * @returns URL publik dari file yang diunggah
   */
  async uploadFile(
    file: Express.Multer.File, // <-- Tipe ini seharusnya sudah valid
    folder: string,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new InternalServerErrorException(
        'File tidak ditemukan untuk diunggah.',
      );
    }

    const originalName = file.originalname; // <-- ESLint error harusnya hilang
    const extension = path.extname(originalName);
    const uniqueFileName = `${uuidv4()}${extension}`;
    const fileKey = `${folder}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer, // <-- ESLint error harusnya hilang
      ContentType: file.mimetype, // <-- ESLint error harusnya hilang
    });

    try {
      await this.s3Client.send(command);
      console.log(
        `[UploadsService] File uploaded successfully to R2: ${fileKey}`,
      );

      let publicUrl: string;
      if (this.publicUrlBase) {
        publicUrl = `${this.publicUrlBase}/${fileKey}`;
      } else {
        console.warn(
          '[UploadsService] R2_PUBLIC_URL not set in .env. Falling back to endpoint-based URL which might not be publicly accessible.',
        );
        // Fallback (sebaiknya set R2_PUBLIC_URL)
        const accountId = this.s3Endpoint.split('.')[0].replace('https://', '');
        const r2Domain = this.s3Endpoint.replace(`https://${accountId}.`, '');
        publicUrl = `https://${this.bucketName}.${accountId}.${r2Domain}/${fileKey}`;
      }

      return { url: publicUrl };
    } catch (error: any) {
      // <-- Tambahkan ': any' untuk error di catch block
      console.error(
        `[UploadsService] Failed to upload file to R2: ${fileKey}`,
        error,
      );
      throw new InternalServerErrorException('Gagal mengunggah file.');
    }
  }
  /**
   * Menghapus file dari Cloudflare R2 berdasarkan URL publiknya.
   * @param fileUrl URL publik lengkap dari file yang akan dihapus
   * @returns Promise<void>
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) {
      this.logger.warn(
        '[UploadsService] Attempted to delete file with empty URL.',
      );
      return; // Tidak ada yang perlu dihapus jika URL kosong
    }

    let fileKey: string;
    try {
      // Ekstrak 'key' (path file) dari URL
      // Asumsi: URL publik R2 biasanya https://<public_url_base>/<fileKey>
      // atau https://<bucket>.<account_id>.r2.cloudflarestorage.com/<fileKey>
      const urlObject = new URL(fileUrl);
      fileKey = urlObject.pathname.substring(1); // Hapus '/' di awal pathname

      if (!fileKey) {
        throw new Error('Path file (key) tidak dapat diekstrak dari URL.');
      }
    } catch (error: unknown) {
      this.logger.error(
        `[UploadsService] Gagal parsing URL untuk delete: ${fileUrl}`,
        error,
      );
      // Mungkin URL tidak valid, kita tidak bisa menghapus, jadi return saja
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(
        `[UploadsService] File deleted successfully from R2: ${fileKey}`,
      );
    } catch (error: unknown) {
      // Tangani error jika file tidak ditemukan di R2 (mungkin sudah dihapus manual)
      // atau error lainnya
      let errorMessage = 'Unknown error during file deletion';
      let errorName = 'UnknownError';
      if (error instanceof Error) {
        errorMessage = error.message;
        errorName = error.name; // Akses .name setelah cek tipe
      }
      if (errorName === 'NoSuchKey') {
        this.logger.warn(
          `[UploadsService] File not found in R2 during delete attempt: ${fileKey}`,
        );
      } else {
        this.logger.error(
          `[UploadsService] Failed to delete file from R2: ${fileKey}. Error: ${errorMessage}`,
          error,
        );
        // Pertimbangkan apakah ingin melempar error atau hanya log
        // throw new InternalServerErrorException('Gagal menghapus file terkait.');
      }
    }
  }
}
