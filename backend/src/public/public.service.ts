// src/public/public.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaClient, TenantStatus, PlatformSetting } from '@prisma/client';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service'; // <-- Tambahkan PrismaService
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
@Injectable()
export class PublicService {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(PublicService.name);
  constructor(private prismaTenantScoped: PrismaService) {}
  async register(registerTenantDto: RegisterTenantDto) {
    const {
      subdomain,
      email,
      password,
      cooperativeName,
      // Detail Koperasi
      skAhuKoperasi,
      province,
      city,
      district,
      village,
      alamatLengkap,
      petaLokasi,
      // Detail PIC (Calon Admin)
      picFullName,
      picNik,
      picGender,
      picPlaceOfBirth,
      picDateOfBirth, // Ini masih string
      picOccupation,
      picAddress,
      picPhoneNumber,
      // Detail Dokumen
      dokPengesahanPendirianUrl,
      dokDaftarUmumUrl,
      dokAkteNotarisUrl,
      dokNpwpKoperasiUrl,
    } = registerTenantDto;

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
      include: { registration: { select: { id: true } } },
    });

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingTenant) {
      if (
        existingTenant.status === TenantStatus.ACTIVE ||
        existingTenant.status === TenantStatus.PENDING
      ) {
        throw new ConflictException('Nama subdomain sudah digunakan.');
      } else if (existingTenant.status === TenantStatus.SUSPENDED) {
        console.log(
          `[PublicService] Re-aplikasi terdeteksi untuk subdomain: ${subdomain}`,
        );

        const conflictingRegistration =
          await this.prisma.tenantRegistration.findFirst({
            where: {
              OR: [{ email }, { picNik }, { picPhoneNumber }],
              tenantId: { not: existingTenant.id },
            },
            select: { id: true },
          });

        if (conflictingRegistration) {
          throw new ConflictException(
            'Email, NIK PIC, atau Nomor HP PIC sudah terdaftar pada pendaftaran lain.',
          );
        }

        // --- PERBAIKAN 2: Cek relasi SEBELUM transaksi ---
        if (!existingTenant.registration) {
          throw new InternalServerErrorException(
            'Data registrasi terkait tidak ditemukan untuk tenant yang suspended.',
          );
        }
        // Simpan ID agar aman digunakan
        const registrationIdToUpdate = existingTenant.registration.id;
        // --- AKHIR PERBAIKAN 2 ---

        try {
          const updatedTenant = await this.prisma.$transaction(async (tx) => {
            await tx.tenantRegistration.update({
              // Gunakan variabel yang sudah divalidasi
              where: { id: registrationIdToUpdate },
              data: {
                cooperativeName,
                skAhuKoperasi,
                province,
                city,
                district,
                village,
                alamatLengkap,
                petaLokasi,
                picFullName,
                picNik,
                picGender,
                picPlaceOfBirth,
                picDateOfBirth: new Date(picDateOfBirth),
                picOccupation,
                picAddress,
                picPhoneNumber,
                email,
                hashedPassword,
                dokPengesahanPendirian: dokPengesahanPendirianUrl,
                dokDaftarUmum: dokDaftarUmumUrl,
                dokAkteNotaris: dokAkteNotarisUrl,
                dokNpwpKoperasi: dokNpwpKoperasiUrl,
              },
            });

            const tenant = await tx.tenant.update({
              where: { id: existingTenant.id },
              data: { status: TenantStatus.PENDING },
            });
            return tenant;
          });

          return {
            message:
              'Pendaftaran ulang berhasil diterima. Silakan tunggu persetujuan kembali dari Administrator.',
            tenantId: updatedTenant.id,
          };
        } catch (error) {
          console.error('Re-application failed:', error);
          if (
            error instanceof InternalServerErrorException ||
            error instanceof ConflictException
          )
            throw error;
          throw new InternalServerErrorException(
            'Gagal memproses pendaftaran ulang.',
          );
        }
      } else {
        // --- PERBAIKAN 3: Gunakan optional chaining untuk ESLint ---
        const currentStatus = existingTenant.status ?? 'tidak diketahui';
        throw new ConflictException(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Status tenant saat ini (${currentStatus}) tidak memperbolehkan pendaftaran ulang.`,
        );
        // --- AKHIR PERBAIKAN 3 ---
      }
    } else {
      console.log(
        `[PublicService] Pendaftaran baru untuk subdomain: ${subdomain}`,
      );

      const conflictingRegistration =
        await this.prisma.tenantRegistration.findFirst({
          where: { OR: [{ email }, { picNik }, { picPhoneNumber }] },
          select: { id: true },
        });

      if (conflictingRegistration) {
        throw new ConflictException(
          'Email, NIK PIC, atau Nomor HP PIC sudah terdaftar.',
        );
      }
      try {
        const newTenant = await this.prisma.$transaction(async (tx) => {
          const tenant = await tx.tenant.create({
            data: {
              name: cooperativeName,
              subdomain,
              schemaName: `tenant_${subdomain}`,
              status: 'PENDING',
            },
          });

          // 3. Simpan data ke TenantRegistration (PERBAIKAN DI SINI)
          await tx.tenantRegistration.create({
            data: {
              // Data Koperasi
              cooperativeName,
              skAhuKoperasi,
              province,
              city,
              district,
              village,
              alamatLengkap,
              petaLokasi,
              // Data PIC (dipetakan ke nama camelCase)
              picFullName: picFullName,
              picNik: picNik,
              picGender: picGender,
              picPlaceOfBirth: picPlaceOfBirth,
              picDateOfBirth: new Date(picDateOfBirth),
              picOccupation: picOccupation,
              picAddress: picAddress,
              picPhoneNumber: picPhoneNumber,
              // Data Akun
              email,
              hashedPassword,
              // Data Dokumen
              dokPengesahanPendirian: dokPengesahanPendirianUrl,
              dokDaftarUmum: dokDaftarUmumUrl,
              dokAkteNotaris: dokAkteNotarisUrl,
              dokNpwpKoperasi: dokNpwpKoperasiUrl,
              // Relasi
              tenantId: tenant.id,
            },
          });
          return tenant;
        });

        return {
          message:
            'Pendaftaran berhasil. Silakan tunggu persetujuan dari Administrator.',
          tenantId: newTenant.id,
        };
      } catch (error) {
        console.error('Registration failed:', error);
        throw new ConflictException(
          'Gagal melakukan pendaftaran, data mungkin duplikat.',
        );
      }
    }
  }
  /**
   * Mengambil informasi kontak publik dari profil koperasi tenant saat ini.
   */
  async getContactInfo() {
    // Gunakan PrismaService yang sudah request-scoped
    const prismaTenant: PrismaClient =
      await this.prismaTenantScoped.getTenantClient();

    try {
      // Ambil data profil, pilih hanya field yang relevan untuk publik
      const profile = await prismaTenant.cooperativeProfile.findFirst({
        select: {
          displayName: true,
          address: true,
          phone: true,
          email: true,
          operatingHours: true,
          mapCoordinates: true,
          logoUrl: true, // Sertakan logo jika perlu
          website: true, // Sertakan website jika perlu
        },
      });

      if (!profile) {
        // Ini seharusnya jarang terjadi jika inisialisasi profil berjalan lancar
        throw new NotFoundException(
          'Informasi profil koperasi tidak ditemukan.',
        );
      }

      return profile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Lemparkan ulang jika NotFound
      }
      console.error('[PublicService] Gagal mengambil info kontak:', error);
      throw new InternalServerErrorException(
        'Gagal mengambil informasi kontak koperasi.',
      );
    }
  }

  /**
   * Menyimpan pesan kontak yang dikirim melalui form publik.
   */
  async saveContactMessage(
    createDto: CreateContactMessageDto,
  ): Promise<{ message: string }> {
    const prismaTenant: PrismaClient =
      await this.prismaTenantScoped.getTenantClient();

    try {
      await prismaTenant.contactMessage.create({
        data: {
          senderName: createDto.senderName,
          senderEmail: createDto.senderEmail,
          subject: createDto.subject,
          message: createDto.message,
        },
      });

      // Opsional: Kirim notifikasi email ke admin koperasi di sini
      // const profile = await this.getContactInfo(); // Ambil email admin dari profil
      // if (profile?.email) {
      //   // Panggil EmailService (perlu di-inject dulu)
      // }

      return { message: 'Pesan Anda berhasil dikirim.' };
    } catch (error) {
      console.error('[PublicService] Gagal menyimpan pesan kontak:', error);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mengirim pesan.',
      );
    }
  }
  /**
   * Mengambil semua pengaturan platform publik.
   * @returns Object { key: value, ... }
   */
  async getPlatformSettings(): Promise<Record<string, string | null>> {
    try {
      // --- Use 'this.prismaPublic' ---
      const settingsList = await this.prisma.platformSetting.findMany();
      // -----------------------------

      const settingsObject = settingsList.reduce(
        (acc: Record<string, string | null>, setting: PlatformSetting) => {
          acc[setting.key] = setting.value;
          return acc;
        },
        {} as Record<string, string | null>,
      );
      return settingsObject;
    } catch (error: any) {
      // <-- Add type 'any' or 'unknown'
      this.logger.error('Failed to get public platform settings', error);
      throw new InternalServerErrorException(
        'Gagal mengambil informasi platform.',
      );
    }
  }

  // --- onModuleDestroy method (CORRECTED & ASYNC) ---
  async onModuleDestroy() {
    // --- Use 'this.prismaPublic' ---
    await this.prisma.$disconnect();
    // -----------------------------
  }
}
