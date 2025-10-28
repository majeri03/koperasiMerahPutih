// backend/src/member-registrations/member-registrations.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Inject, // <-- Import Inject
  Scope, // <-- Import Scope
  NotFoundException, // <-- Import NotFoundException
  BadRequestException, // <-- Import BadRequestException
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core'; // <-- Import REQUEST
import type { Request } from 'express'; // <-- Import Request express
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberRegistrationDto } from './dto/create-member-registration.dto';
import * as bcrypt from 'bcrypt';
import {
  PrismaClient,
  MemberRegistration,
  Prisma,
  RegistrationStatus,
} from '@prisma/client';
import { EmailService } from 'src/email/email.service';
// --- BUAT SERVICE MENJADI REQUEST SCOPED ---
@Injectable({ scope: Scope.REQUEST })
export class MemberRegistrationsService {
  private prismaPublic = new PrismaClient(); // <-- Client untuk akses tabel public.tenants

  constructor(
    private prisma: PrismaService, // Ini tetap untuk getTenantClient() default
    @Inject(REQUEST) private request: Request, // <-- Inject Request object
    private emailService: EmailService,
  ) {}
  // --- AKHIR PERUBAHAN CONSTRUCTOR ---

  /**
   * Menerima data pendaftaran, validasi duplikasi, hash password,
   * dan menyimpan ke tabel member_registrations dengan status PENDING.
   * Menangani pendaftaran dari subdomain (via middleware) atau domain utama (via DTO).
   * @param createDto Data dari form pendaftaran
   * @returns Data registrasi yang baru disimpan (tanpa password)
   */
  async createRegistration(
    createDto: CreateMemberRegistrationDto,
  ): Promise<Omit<MemberRegistration, 'hashedPassword'>> {
    const { email, nik, password, targetSubdomain, ...registrationData } =
      createDto;

    // --- Logika Mendapatkan Prisma Client Target ---
    let prismaTenant: PrismaClient;
    const tenantIdFromMiddleware = this.request.tenantId;

    if (tenantIdFromMiddleware) {
      // Kasus 1: Akses via subdomain, gunakan PrismaService default
      console.log(
        `[MemberRegService] Using tenant from middleware: ${tenantIdFromMiddleware}`,
      );
      try {
        prismaTenant = await this.prisma.getTenantClient(); // Gunakan instance dari PrismaService
      } catch (error) {
        console.error(
          `[MemberRegService] Error getting tenant client from middleware for ${tenantIdFromMiddleware}:`,
          error,
        );
        // Handle error jika tenant tidak ditemukan atau tidak aktif
        if (error instanceof NotFoundException) {
          throw new NotFoundException(
            `Koperasi dengan subdomain '${tenantIdFromMiddleware}' tidak ditemukan atau tidak aktif.`,
          );
        }
        throw new InternalServerErrorException(
          'Gagal mendapatkan koneksi database koperasi.',
        );
      }
    } else if (targetSubdomain) {
      // Kasus 2: Akses via domain utama, gunakan targetSubdomain dari DTO
      console.log(
        `[MemberRegService] Using tenant from DTO: ${targetSubdomain}`,
      );
      try {
        // Cari tenant di tabel public.tenants
        const tenant = await this.prismaPublic.tenant.findUnique({
          where: { subdomain: targetSubdomain },
        });

        if (!tenant) {
          throw new NotFoundException(
            `Koperasi dengan subdomain '${targetSubdomain}' tidak ditemukan.`,
          );
        }
        if (tenant.status !== 'ACTIVE') {
          throw new BadRequestException(
            `Koperasi '${tenant.name}' saat ini tidak aktif untuk pendaftaran.`,
          );
        }

        // Dapatkan koneksi tenant spesifik (mirip logika di PrismaService tapi tanpa request scope)
        const originalUrl = process.env.DATABASE_URL;
        if (!originalUrl) throw new Error('DATABASE_URL missing');
        const separator = originalUrl.includes('?') ? '&' : '?';
        const tenantUrl = `${originalUrl}${separator}schema=${tenant.schemaName}`;

        prismaTenant = new PrismaClient({
          datasources: { db: { url: tenantUrl } },
        });
        // PENTING: Koneksi manual ini perlu di-disconnect nanti jika aplikasi kompleks
      } catch (error) {
        console.error(
          `[MemberRegService] Error finding or connecting to tenant ${targetSubdomain}:`,
          error,
        );
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException
        ) {
          throw error; // Lemparkan error spesifik
        }
        throw new InternalServerErrorException(
          'Gagal memproses pendaftaran untuk koperasi yang dituju.',
        );
      }
    } else {
      // Kasus 3: Akses via domain utama TAPI targetSubdomain tidak diisi
      throw new BadRequestException(
        'Subdomain koperasi tujuan (targetSubdomain) harus disertakan saat mendaftar dari domain utama.',
      );
    }
    // --- Akhir Logika Mendapatkan Prisma Client Target ---

    // 1. Cek duplikasi email atau NIK di tabel registrasi (yang pending)
    const existingRegistration =
      await prismaTenant.memberRegistration.findFirst({
        where: { OR: [{ email }, { nik }] },
        select: { id: true },
      });

    if (existingRegistration) {
      await this.disconnectManualClient(prismaTenant);
      throw new ConflictException(
        `Email atau NIK sudah digunakan untuk mendaftar (status pending).`,
      );
    }

    // --- PERBAIKAN DI SINI: Pisahkan pengecekan ---

    // 2. Cek duplikasi NIK di tabel member (HANYA NIK)
    const existingMember = await prismaTenant.member.findFirst({
      where: { nik: nik }, // Cek NIK di tabel member
      select: { id: true },
    });

    if (existingMember) {
      await this.disconnectManualClient(prismaTenant);
      throw new ConflictException(
        `NIK sudah terdaftar sebagai anggota aktif di koperasi ini.`,
      );
    }

    // 3. Cek duplikasi Email di tabel user (HANYA EMAIL)
    const existingUser = await prismaTenant.user.findFirst({
      where: { email: email }, // Cek Email di tabel user
      select: { id: true },
    });

    if (existingUser) {
      await this.disconnectManualClient(prismaTenant);
      throw new ConflictException(
        `Email sudah terdaftar sebagai pengguna (anggota/pengurus) aktif di koperasi ini.`,
      );
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Simpan data pendaftaran
    try {
      const dateOfBirthString = registrationData.dateOfBirth;
      const newRegistration = await prismaTenant.memberRegistration.create({
        data: {
          ...registrationData, // Pastikan field tambahan (placeOfBirth, dll) ada di sini jika di DTO
          dateOfBirth: new Date(dateOfBirthString),
          email,
          nik,
          hashedPassword,
          status: RegistrationStatus.PENDING,
          // dateOfBirth: registrationData.dateOfBirth ? new Date(registrationData.dateOfBirth) : undefined, // Contoh konversi tanggal
        },
      });

      // Hapus hashedPassword dari objek yang dikembalikan
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword: _, ...result } = newRegistration;
      return result;
    } catch (error) {
      console.error('Gagal menyimpan pendaftaran anggota:', error);
      throw new InternalServerErrorException(
        'Gagal memproses pendaftaran anggota.',
      );
    } finally {
      // --- Penting: Disconnect client manual ---
      await this.disconnectManualClient(prismaTenant);
      // --- Akhir disconnect ---
    }
  } // Akhir createRegistration

  // --- Fungsi helper untuk disconnect client manual ---
  private async disconnectManualClient(client: PrismaClient) {
    // Hanya disconnect jika client BUKAN instance default dari PrismaService
    // Cara cek sederhana: apakah client punya method getTenantClient? Jika tidak, berarti manual.
    if (!('request' in client)) {
      console.log('[MemberRegService] Disconnecting manual Prisma client...');
      await client.$disconnect();
    }
  }
  // --- Akhir fungsi helper ---

  /**
   * Mengambil daftar pendaftaran anggota yang masih berstatus PENDING.
   */
  async getPendingRegistrations(): Promise<
    Omit<MemberRegistration, 'hashedPassword'>[]
  > {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();
    try {
      const pendingList = await prismaTenant.memberRegistration.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' }, // Tampilkan yang paling lama mendaftar dulu
        // Pilih field yang ingin ditampilkan (kecuali password)
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          nik: true,
          fullName: true,
          gender: true,
          email: true,
          phoneNumber: true,
          // Tambahkan field yang hilang:
          placeOfBirth: true,
          dateOfBirth: true,
          occupation: true,
          address: true,
          // ktpScanUrl: true, // Uncomment jika ada
          // photoUrl: true,   // Uncomment jika ada
          status: true,
          processedById: true,
          processedAt: true,
          rejectionReason: true,
        },
      });
      return pendingList;
    } catch (error) {
      console.error('Gagal mengambil pendaftaran pending:', error);
      throw new InternalServerErrorException(
        'Gagal mengambil daftar pendaftaran anggota.',
      );
    }
  }

  /**
   * Menyetujui pendaftaran anggota.
   * Membuat record Member dan User baru, lalu update status registrasi.
   * @param registrationId ID Pendaftaran Anggota (dari tabel member_registrations)
   * @param processedById ID User Pengurus yang melakukan approval
   */
  async approveRegistration(
    registrationId: string,
    processedById: string,
  ): Promise<{ memberId: string; userId: string }> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // 1. Ambil data registrasi & pastikan statusnya PENDING
    const registration = await prismaTenant.memberRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException(
        `Pendaftaran dengan ID ${registrationId} tidak ditemukan.`,
      );
    }
    if (registration.status !== 'PENDING') {
      throw new BadRequestException(
        `Pendaftaran ini sudah diproses (status: ${registration.status}).`,
      );
    }

    // 2. Dapatkan Role 'Anggota'
    const anggotaRole = await prismaTenant.role.findUnique({
      where: { name: 'Anggota' }, // Pastikan role 'Anggota' ada di DB
    });
    if (!anggotaRole) {
      // Ini error kritis, seharusnya Role 'Anggota' selalu ada
      console.error("Role 'Anggota' tidak ditemukan di database!");
      throw new InternalServerErrorException(
        'Konfigurasi role sistem tidak lengkap.',
      );
    }

    // 3. Gunakan Transaksi Database
    let result: { memberId: string; userId: string };
    try {
      result = await prismaTenant.$transaction(async (tx) => {
        // Generate UUID baru untuk Member dan User (bisa sama)
        // Jika Anda menggunakan `gen_random_uuid()` di DB, Prisma otomatis menanganinya
        // Jika tidak, Anda bisa generate di sini: import { v4 as uuidv4 } from 'uuid'; const newId = uuidv4();

        // 3.1 Buat record Member (Buku 01)
        //    Gunakan data dari 'registration'. Pastikan field cocok!
        const newMember = await tx.member.create({
          data: {
            memberNumber: `AGT-${Date.now()}`,
            fullName: registration.fullName,
            nik: registration.nik,
            gender: registration.gender, // Langsung gunakan dari registrasi
            placeOfBirth: registration.placeOfBirth, // Ambil dari registrasi
            dateOfBirth: new Date(registration.dateOfBirth), // Konversi ke Date
            occupation: registration.occupation, // Ambil dari registrasi
            address: registration.address,
            phoneNumber: registration.phoneNumber,
            status: 'ACTIVE',
            // joinDate: default now()
            // fingerprintUrl: registration.fingerprintUrl, // Jika ada
            // signatureUrl: registration.signatureUrl,     // Jika ada
          },
          select: { id: true },
        });

        // 3.2 Buat record User
        const newUser = await tx.user.create({
          data: {
            id: newMember.id,
            fullName: registration.fullName,
            email: registration.email,
            passwordHash: registration.hashedPassword,
            roleId: anggotaRole.id,
            status: 'active',
          },
          select: { id: true },
        });

        await tx.memberRegistration.update({
          where: { id: registrationId },
          data: {
            status: 'APPROVED',
            processedById: processedById,
            processedAt: new Date(),
          },
        });

        return { memberId: newMember.id, userId: newUser.id };
      });
      try {
        if (!registration || !registration.email || !registration.fullName) {
          console.error(
            `[MemberRegService] Data registrasi krusial hilang saat mencoba kirim email approval untuk ID ${registrationId}`,
          );
          // Jangan throw error, cukup batalkan pengiriman email
          return result; // Kembalikan hasil transaksi
        }
        const subdomain = this.request.tenantId;
        if (!subdomain) {
          throw new Error('Subdomain (tenantId) tidak ditemukan di request.');
        }

        // Ambil nama Koperasi dari DB Publik
        const tenant = await this.prismaPublic.tenant.findUnique({
          where: { subdomain },
          select: { name: true },
        });
        const cooperativeName = tenant?.name ?? 'Koperasi Anda';

        const htmlBody = this.emailService.createMemberApprovedHtml(
          registration.fullName,
          cooperativeName,
          subdomain,
        );

        await this.emailService.sendEmail(
          registration.email,
          `Pendaftaran Anggota Disetujui - ${cooperativeName}`,
          htmlBody,
          cooperativeName, // Nama Pengirim (Sender Name)
        );
      } catch (emailError) {
        // Jika email gagal, jangan gagalkan request. Cukup log error.
        console.error(
          `[MemberRegService] Registrasi ${registrationId} berhasil, TAPI GAGAL kirim email notifikasi ke ${registration.email}:`,
          emailError,
        );
      }

      return result;
    } catch (error) {
      console.error(`Gagal menyetujui pendaftaran ${registrationId}:`, error);
      // Handle potensi error unique constraint jika ada race condition (jarang terjadi)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Gagal membuat anggota/user, data mungkin sudah ada.',
        );
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat menyetujui pendaftaran.',
      );
    }
  }

  /**
   * Menolak pendaftaran anggota.
   * Hanya mengubah status registrasi menjadi REJECTED.
   * @param registrationId ID Pendaftaran Anggota
   * @param processedById ID User Pengurus yang menolak
   * @param reason Alasan penolakan
   */
  async rejectRegistration(
    registrationId: string,
    processedById: string,
    reason: string,
  ): Promise<void> {
    const prismaTenant: PrismaClient = await this.prisma.getTenantClient();

    // 1. Ambil data registrasi & pastikan statusnya PENDING
    const registration = await prismaTenant.memberRegistration.findUnique({
      where: { id: registrationId },
      select: { status: true, fullName: true, email: true }, // Cukup ambil status
    });

    if (!registration) {
      throw new NotFoundException(
        `Pendaftaran dengan ID ${registrationId} tidak ditemukan.`,
      );
    }
    if (registration.status !== 'PENDING') {
      throw new BadRequestException(
        `Pendaftaran ini sudah diproses (status: ${registration.status}).`,
      );
    }

    // 2. Update status registrasi menjadi REJECTED
    try {
      await prismaTenant.memberRegistration.update({
        where: { id: registrationId },
        data: {
          status: RegistrationStatus.REJECTED, // Gunakan Enum
          processedById: processedById, // Gunakan parameter
          processedAt: new Date(),
          rejectionReason: reason, // Gunakan parameter
        },
      });
      // 3. (BARU) Kirim Email Notifikasi (SETELAH UPDATE SUKSES)
      try {
        if (!registration || !registration.email || !registration.fullName) {
          console.error(
            `[MemberRegService] Data registrasi krusial hilang saat mencoba kirim email rejection untuk ID ${registrationId}`,
          );
          // Jangan throw error, cukup batalkan pengiriman email
          return; // Keluar dari fungsi (karena return type void)
        }
        const subdomain = this.request.tenantId;
        if (!subdomain) {
          throw new Error('Subdomain (tenantId) tidak ditemukan di request.');
        }

        // Ambil nama Koperasi dari DB Publik
        const tenant = await this.prismaPublic.tenant.findUnique({
          where: { subdomain },
          select: { name: true },
        });
        const cooperativeName = tenant?.name ?? 'Koperasi Anda';

        const htmlBody = this.emailService.createMemberRejectedHtml(
          registration.fullName,
          cooperativeName,
          reason, // <-- Masukkan alasan penolakan
        );

        await this.emailService.sendEmail(
          registration.email,
          `Pendaftaran Anggota Ditolak - ${cooperativeName}`,
          htmlBody,
          cooperativeName, // Nama Pengirim (Sender Name)
        );
      } catch (emailError) {
        // Jika email gagal, jangan gagalkan request. Cukup log error.
        console.error(
          `[MemberRegService] Penolakan ${registrationId} berhasil, TAPI GAGAL kirim email notifikasi ke ${registration.email}:`,
          emailError,
        );
      }
      // Tidak perlu return apa-apa (void)
    } catch (error) {
      console.error(`Gagal menolak pendaftaran ${registrationId}:`, error);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat menolak pendaftaran.',
      );
    }
  }
}
