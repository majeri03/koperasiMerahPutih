// src/admin/platform-settings/platform-settings.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService
import { Prisma, PrismaClient, PlatformSetting } from '@prisma/client';
import { UploadsService } from 'src/uploads/uploads.service'; // <-- Import UploadsService
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';

@Injectable()
export class PlatformSettingsService {
  private prismaPublic = new PrismaClient(); // <-- Client langsung ke skema public
  private readonly logger = new Logger(PlatformSettingsService.name); // <-- Tambahkan Logger

  constructor(
    private uploadsService: UploadsService, // <-- Inject UploadsService
    private configService: ConfigService, // <-- Inject ConfigService (jika perlu base URL R2)
  ) {}

  /**
   * Mengambil semua pengaturan platform dari DB public.
   * @returns Object { key: value, ... }
   */
  async getAllSettings(): Promise<Record<string, string | null>> {
    try {
      const settingsList = await this.prismaPublic.platformSetting.findMany();
      // Ubah array [{key, value}, ...] menjadi object { key: value, ... }
      const settingsObject = settingsList.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        },
        {} as Record<string, string | null>,
      );
      return settingsObject;
    } catch (error) {
      this.logger.error('Failed to get all platform settings', error);
      throw new InternalServerErrorException(
        'Gagal mengambil pengaturan platform.',
      );
    }
  }

  /**
   * Memperbarui satu atau beberapa pengaturan platform.
   * Menggunakan upsert untuk membuat key baru jika belum ada.
   * @param updates Array dari { key: string, value: string | null }
   */
  async updateSettings(
    updates: UpdatePlatformSettingDto[],
  ): Promise<{ message: string }> {
    if (!Array.isArray(updates) || updates.length === 0) {
      return { message: 'Tidak ada data pembaruan yang diberikan.' };
    }

    try {
      // Jalankan semua upsert dalam satu transaksi
      await this.prismaPublic.$transaction(
        updates.map((setting) =>
          this.prismaPublic.platformSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value, updatedAt: new Date() },
            create: {
              key: setting.key,
              value: setting.value,
              updatedAt: new Date(),
            },
          }),
        ),
      );
      this.logger.log(
        `Successfully updated ${updates.length} platform settings.`,
      );
      return { message: `${updates.length} pengaturan berhasil diperbarui.` };
    } catch (error) {
      this.logger.error('Failed to update platform settings', error);
      throw new InternalServerErrorException(
        'Gagal memperbarui pengaturan platform.',
      );
    }
  }

  /**
   * Mengunggah gambar untuk pengaturan platform dan menyimpan URL-nya.
   * @param key Kunci pengaturan tempat menyimpan URL (misal: 'hero_image_url')
   * @param file File gambar yang diunggah
   */
  async uploadImageAndUpdateSetting(
    key: string,
    file: Express.Multer.File,
  ): Promise<PlatformSetting> {
    const folderPath = 'platform/images'; // <-- Path di R2 untuk gambar platform (bukan tenant)

    // --- Validasi Key (Opsional tapi bagus) ---
    // Anda bisa menambahkan daftar key yang valid untuk gambar di sini
    const validImageKeys = ['hero_image_url', 'platform_logo_url']; // Contoh
    if (!validImageKeys.includes(key)) {
      throw new NotFoundException(
        `Kunci pengaturan gambar '${key}' tidak valid.`,
      );
    }
    // --- Akhir Validasi Key ---

    let uploadedUrl: string;
    try {
      // Panggil UploadsService untuk upload
      const result = await this.uploadsService.uploadFile(file, folderPath);
      uploadedUrl = result.url;
      this.logger.log(
        `Platform image uploaded for key '${key}': ${uploadedUrl}`,
      );
    } catch (uploadError) {
      this.logger.error(
        `Failed to upload platform image for key '${key}'`,
        uploadError,
      );
      // UploadsService sudah melempar InternalServerErrorException jika gagal
      throw uploadError;
    }

    // Ambil URL gambar lama (jika ada) sebelum update
    const oldSetting = await this.prismaPublic.platformSetting.findUnique({
      where: { key },
    });
    const oldImageUrl = oldSetting?.value;

    try {
      // Simpan URL baru ke database menggunakan upsert
      const updatedSetting = await this.prismaPublic.platformSetting.upsert({
        where: { key: key },
        update: { value: uploadedUrl, updatedAt: new Date() },
        create: { key: key, value: uploadedUrl, updatedAt: new Date() },
      });

      // Hapus gambar lama dari R2 SETELAH DB berhasil diupdate
      if (oldImageUrl && oldImageUrl !== uploadedUrl) {
        try {
          await this.uploadsService.deleteFile(oldImageUrl);
          this.logger.log(
            `Old platform image deleted for key '${key}': ${oldImageUrl}`,
          );
        } catch (deleteError) {
          this.logger.error(
            `Failed to delete old platform image '${oldImageUrl}' for key '${key}'`,
            deleteError,
          );
          // Jangan gagalkan proses utama jika hapus file lama gagal
        }
      }

      return updatedSetting;
    } catch (dbError) {
      this.logger.error(
        `Failed to save platform image URL for key '${key}' to DB`,
        dbError,
      );
      // Jika DB gagal, coba hapus gambar yang baru diupload (rollback manual)
      try {
        await this.uploadsService.deleteFile(uploadedUrl);
        this.logger.warn(
          `Rolled back uploaded image due to DB error: ${uploadedUrl}`,
        );
      } catch (rollbackError) {
        this.logger.error(
          `CRITICAL: Failed to rollback uploaded image ${uploadedUrl} after DB error`,
          rollbackError,
        );
      }
      throw new InternalServerErrorException(
        'Gagal menyimpan URL gambar ke pengaturan.',
      );
    }
  }

  // Pastikan disconnect saat aplikasi berhenti
  async onModuleDestroy() {
    await this.prismaPublic.$disconnect();
  }

  async findAllPublic(): Promise<Record<string, string>> {
    try {
      // 1. Menggunakan 'this.prismaPublic' seperti di 'updateSettings'
      const settings = await this.prismaPublic.platformSetting.findMany();

      // 2. Ubah jadi objek, dengan tipe eksplisit untuk linter
      const settingsMap = settings.reduce(
        (acc: Record<string, string>, setting) => {
          // Model di schema.prisma menggunakan 'settingKey' dan 'settingValue'
          acc[setting.key] = setting.value ?? '';
          return acc;
        },
        {} as Record<string, string>,
      );

      return settingsMap;
    } catch (error: unknown) {
      // 3. Menggunakan 'this.logger' seperti di 'updateSettings'
      this.logger.error('Failed to fetch public platform settings', error);

      // 4. Error handling yang konsisten
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          `Prisma Error ${error.code}: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Gagal mengambil pengaturan platform publik.',
      );
    }
  }
}
