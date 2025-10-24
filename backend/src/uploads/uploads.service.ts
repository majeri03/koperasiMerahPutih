// src/uploads/uploads.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
// Pastikan @types/multer sudah terinstall

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly s3Endpoint: string;
  private readonly publicUrlBase?: string;

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
}
