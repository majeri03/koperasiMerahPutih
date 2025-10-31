import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import {
  Prisma,
  PrismaClient,
  TenantRegistration,
  Gender,
  TenantStatus,
} from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { MidtransService } from 'src/midtrans/midtrans.service';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/email/email.service';
@Injectable()
export class TenantsService {
  private readonly prisma = new PrismaClient();

  constructor(
    @Inject(forwardRef(() => MidtransService))
    private midtransService: MidtransService,
    private emailService: EmailService,
  ) {}

  findPending() {
    return this.prisma.tenant.findMany({
      where: { status: 'PENDING' },
    });
  }
  async approve(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, status: 'PENDING' },
      select: { id: true, name: true, subdomain: true },
    });

    if (!tenant) {
      throw new NotFoundException(
        'Tenant tidak ditemukan atau sudah disetujui.',
      );
    }
    const registrationData = await this.prisma.tenantRegistration.findUnique({
      where: { tenantId: tenant.id },
      select: { picFullName: true, email: true },
    });
    if (!registrationData) {
      throw new InternalServerErrorException(
        `Data pendaftaran untuk tenant ${tenantId} tidak ditemukan.`,
      );
    }

    /*
    // =================================================================
    // BAGIAN PEMBAYARAN MIDTRANS (DINONAKTIFKAN)
    // =================================================================

    const registrationData = await this.prisma.tenantRegistration.findUnique({
        where: { tenantId: tenant.id },
    });
    
    if (!registrationData) {
        throw new InternalServerErrorException(
            `Data pendaftaran untuk tenant ${tenantId} tidak ditemukan.`
        );
    }

    const registrationFee = 100000; // Contoh biaya pendaftaran
    const transaction = await this.midtransService.createTransaction(
      tenant.id,
      registrationFee,
      {
          firstName: registrationData.fullName,
          email: registrationData.email
      },
    );
    console.log(`Memulai proses pembayaran untuk tenant: ${tenant.name}`);

    return {
      message: 'Tautan pembayaran berhasil dibuat.',
      paymentUrl: transaction.redirect_url,
    };
    // =================================================================
    */

    // =================================================================
    // ALUR AKTIVASI LANGSUNG (TANPA PEMBAYARAN)
    // =================================================================
    // Panggil fungsi aktivasi secara langsung. Fungsi ini sudah menggunakan
    // data asli dari `tenant_registrations` dan tidak lagi memakai data dummy.
    try {
      // Panggil fungsi aktivasi (yang sekarang fokus pada DB setup)
      await this.activateTenant(tenantId); // activateTenant sekarang tidak perlu return message

      // Kirim Email Notifikasi (SETELAH activateTenant SUKSES)
      try {
        const htmlBody = this.emailService.createTenantApprovedHtml(
          registrationData.picFullName,
          tenant.name,
          tenant.subdomain, // Gunakan subdomain dari query
        );

        await this.emailService.sendEmail(
          registrationData.email,
          `Pendaftaran Koperasi Disetujui - ${tenant.name}`,
          htmlBody,
          'Platform Koperasi', // Sender Name (Generik)
        );
      } catch (emailError) {
        console.error(
          `[TenantService] Aktivasi tenant ${tenantId} berhasil, TAPI GAGAL kirim email notifikasi ke ${registrationData.email}:`,
          emailError,
        );
        // Jangan gagalkan proses utama
      }

      return {
        message: 'Koperasi telah berhasil diaktifkan dan notifikasi terkirim.',
        tenantId: tenant.id,
      };
    } catch (activationError) {
      // Tangani error dari activateTenant
      console.error(
        `[TenantService] Gagal mengaktifkan tenant ${tenantId} saat proses approval:`,
        activationError,
      );
      // Lemparkan ulang error agar controller tahu
      throw activationError;
    }
  }
  async create(createTenantDto: CreateTenantDto) {
    const {
      name,
      subdomain,
      adminName,
      adminEmail,
      adminPassword,
      adminNik,
      adminGender,
      adminPlaceOfBirth,
      adminDateOfBirth, // Ini string YYYY-MM-DD
      adminOccupation,
      adminAddress,
    } = createTenantDto;
    const schemaName = `tenant_${subdomain}`;

    // Cek duplikasi subdomain (tetap sama)
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Subdomain sudah digunakan.');
    }

    // Hash password admin
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // 1. Buat Tenant (tetap sama)
          const newTenant = await tx.tenant.create({
            data: { name, subdomain, schemaName, status: TenantStatus.ACTIVE }, // Atau PENDING? Sesuai kebutuhan
          });

          // 2. Buat Skema (tetap sama)
          await tx.$executeRawUnsafe(
            `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`,
          );

          // 3. Buat Tabel (tetap sama)
          await this.createTenantTables(tx, schemaName);

          // 4. Buat Admin, Member, dan Posisi Awal
          // Siapkan data untuk fungsi helper
          const adminDetailsForHelper = {
            fullName: adminName,
            email: adminEmail,
            hashedPassword: hashedPassword, // Kirim HASHED password
            nik: adminNik,
            gender: adminGender,
            placeOfBirth: adminPlaceOfBirth,
            dateOfBirth: new Date(adminDateOfBirth), // <-- Konversi string ke Date di sini
            occupation: adminOccupation,
            address: adminAddress,
          };

          // Panggil fungsi helper dengan data yang sudah disiapkan
          await this.createFirstAdminMemberAndPosition(
            // <-- Nama fungsi baru
            tx,
            schemaName,
            adminDetailsForHelper, // <-- Kirim objek data admin
          );
          await this.createInitialCooperativeProfile(
            tx,
            schemaName,
            createTenantDto.name, // Ambil dari DTO
            createTenantDto.adminAddress, // Gunakan alamat admin sebagai default
            createTenantDto.adminEmail, // Gunakan email admin sebagai default
            null, // createTenantDto tidak punya no HP koperasi
          );
          return {
            message:
              'Koperasi berhasil dibuat beserta akun pengurus pertama, data anggota, dan jabatan awal.',
            tenant: newTenant,
          };
        },
        { timeout: 20000 }, // Sesuaikan timeout jika perlu
      );
    } catch (error) {
      console.error('Failed to create tenant:', error);
      // Tangani error spesifik jika perlu (misal: ConflictException dari helper)
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat koperasi baru.');
    }
  }

  /**
   * Menolak pendaftaran tenant (koperasi).
   * Mengubah status Tenant menjadi REJECTED.
   * Mengirim email notifikasi ke PIC.
   * @param tenantId ID Tenant yang akan ditolak
   * @param reason Alasan penolakan
   */
  async rejectTenant(tenantId: string, reason: string) {
    console.log(`[TenantService] Mencoba menolak tenant ID: ${tenantId}`);

    // 1. Cari Tenant & Registrasi Data
    // Kita butuh transaksi karena membaca dari 2 tabel & update 1 tabel
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Cari tenant yang statusnya PENDING
        const tenant = await tx.tenant.findFirst({
          where: { id: tenantId, status: TenantStatus.PENDING },
        });

        if (!tenant) {
          throw new NotFoundException(
            `Tenant dengan ID ${tenantId} tidak ditemukan atau statusnya bukan PENDING.`,
          );
        }

        // Cari data registrasi terkait untuk info PIC
        const registrationData = await tx.tenantRegistration.findUnique({
          where: { tenantId: tenant.id },
          select: { picFullName: true, email: true }, // Hanya ambil data yg perlu
        });

        if (!registrationData) {
          // Ini seharusnya tidak terjadi jika data konsisten
          throw new InternalServerErrorException(
            `Data pendaftaran untuk tenant ${tenantId} tidak ditemukan.`,
          );
        }

        // 2. Update Status Tenant menjadi REJECTED
        await tx.tenant.update({
          where: { id: tenantId },
          data: { status: TenantStatus.SUSPENDED }, // Gunakan Enum
        });

        return { tenant, registrationData }; // Kembalikan data untuk email
      });
      // --- AKHIR TRANSAKSI ---

      // 3. Kirim Email Notifikasi (SETELAH TRANSAKSI SUKSES)
      try {
        const { tenant, registrationData } = result;
        if (
          !tenant ||
          !registrationData ||
          !registrationData.email ||
          !registrationData.picFullName
        ) {
          console.error(
            `[TenantService] Data tenant/registrasi krusial hilang saat mencoba kirim email rejection untuk ID ${tenantId}`,
          );
          // Jangan throw error, cukup batalkan pengiriman email
          return {
            // Kembalikan pesan sukses tanpa email
            message: `Tenant ${result.tenant?.name ?? tenantId} berhasil ditolak (email gagal dikirim).`,
            tenantId: result.tenant?.id ?? tenantId,
          };
        }
        const htmlBody = this.emailService.createTenantRejectedHtml(
          registrationData.picFullName,
          tenant.name,
          reason,
        );

        await this.emailService.sendEmail(
          registrationData.email,
          `Pendaftaran Koperasi Ditolak - ${tenant.name}`,
          htmlBody,
          'Platform Koperasi', // Sender Name (Generik)
        );
      } catch (emailError) {
        console.error(
          `[TenantService] Penolakan tenant ${tenantId} berhasil, TAPI GAGAL kirim email notifikasi ke ${result.registrationData.email}:`,
          emailError,
        );
        // Jangan gagalkan proses utama
      }

      return {
        message: `Tenant ${result.tenant.name} berhasil ditolak.`,
        tenantId: result.tenant.id,
      };
    } catch (error) {
      // Tangani error dari transaksi
      console.error(`[TenantService] Gagal menolak tenant ${tenantId}:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error; // Lemparkan error spesifik
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat menolak pendaftaran koperasi.',
      );
    }
  }

  private async createTenantTables(
    tx: Prisma.TransactionClient,
    schemaName: string,
  ) {
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      );
    `);
    await tx.$executeRawUnsafe(`
      INSERT INTO "${schemaName}".roles (name) VALUES ('Pengurus'), ('Anggota'), ('Pengawas');
    `);
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".users (
        id VARCHAR(36) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        hashed_refresh_token TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        role_id INT NOT NULL,
        CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES "${schemaName}".roles(id)
      );
    `);
    await tx.$executeRawUnsafe(`
    CREATE TYPE "${schemaName}"."Gender" AS ENUM ('MALE', 'FEMALE');
  `);
    await tx.$executeRawUnsafe(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registrationstatus' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
              CREATE TYPE "${schemaName}"."RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
          END IF;
      END $$;
    `);

    // Tabel Member Registrations
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".member_registrations (
        "id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        "nik" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
        "gender" TEXT NOT NULL CHECK ("gender" IN ('MALE', 'FEMALE')), -- Sesuaikan tipe jika perlu
        "email" TEXT NOT NULL,
        "phone_number" TEXT NOT NULL,
        "hashed_password" TEXT NOT NULL,
        "place_of_birth" TEXT NOT NULL,    -- Kolom baru
        "date_of_birth" TIMESTAMP(3) NOT NULL, -- Kolom baru
        "occupation" TEXT NOT NULL,        -- Kolom baru
        "address" TEXT NOT NULL,           -- Kolom baru
        -- "ktp_scan_url" TEXT,            -- Opsional
        -- "photo_url" TEXT,               -- Opsional
        "status" "${schemaName}"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
        "signature_data" TEXT NULL,
        "processed_by_id" TEXT,
        "processed_at" TIMESTAMP(3),
        "rejection_reason" TEXT,

        CONSTRAINT "member_registrations_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "member_registrations_nik_key" UNIQUE ("nik"),
        CONSTRAINT "member_registrations_email_key" UNIQUE ("email"),
        CONSTRAINT "member_registrations_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".members (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "member_number" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
        "nik" TEXT NOT NULL,
        "place_of_birth" TEXT NOT NULL,
        "date_of_birth" TIMESTAMP(3) NOT NULL,
        "gender" TEXT NOT NULL CHECK ("gender" IN ('MALE', 'FEMALE')),
        "occupation" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "phone_number" TEXT NULL,
        "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "signature_data" TEXT NULL,
        "resignation_request_date" TIMESTAMP(3),
        "termination_date" TIMESTAMP(3),
        "termination_reason" TEXT,
        "approved_by_ketua_id" TEXT NULL, 
        "approved_at" TIMESTAMP(3) NULL,
        "termination_approved_by_ketua_id" TEXT NULL, 
        "termination_approved_at" TIMESTAMP(3) NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "members_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "members_approved_by_ketua_id_fkey" FOREIGN KEY ("approved_by_ketua_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "members_termination_approved_by_ketua_id_fkey" FOREIGN KEY ("termination_approved_by_ketua_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "members_member_number_key" UNIQUE ("member_number"),
        CONSTRAINT "members_nik_key" UNIQUE ("nik")
        );
    `);

    await tx.$executeRawUnsafe(`
      CREATE TYPE "${schemaName}"."JabatanPengurus" AS ENUM (
        'Ketua',
        'Sekretaris',
        'Bendahara'
        -- Tambahkan jabatan lain jika diperlukan di masa depan
        -- 'Wakil_Ketua', 
        -- 'Lainnya'
      );
    `);
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".board_positions (
     "id" TEXT NOT NULL,
     "jabatan" "${schemaName}"."JabatanPengurus" NOT NULL,
     "tanggal_diangkat" TIMESTAMP(3) NOT NULL,
     "tanggal_berhenti" TIMESTAMP(3),
     "alasan_berhenti" TEXT,
     "member_id" TEXT NOT NULL,
     "termination_approved_by_user_id" TEXT NULL,
     "termination_approved_at" TIMESTAMP(3) NULL,
     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updated_at" TIMESTAMP(3) NOT NULL,

     CONSTRAINT "board_positions_pkey" PRIMARY KEY ("id"),
     CONSTRAINT "board_positions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
     CONSTRAINT "board_positions_termination_approved_by_user_id_fkey" FOREIGN KEY ("termination_approved_by_user_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
   );
 `);
    // Opsional: Tambahkan index jika diperlukan, misal pada member_id
    // await tx.$executeRawUnsafe(`CREATE INDEX "board_positions_member_id_idx" ON "${schemaName}"."board_positions"("member_id");`);
    await tx.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}".supervisory_positions (
     "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
     "jabatan" TEXT NOT NULL,
     "tanggal_diangkat" TIMESTAMP(3) NOT NULL,
     "tanggal_berhenti" TIMESTAMP(3),
     "alasan_berhenti" TEXT,
     "member_id" TEXT NOT NULL,
     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updated_at" TIMESTAMP(3) NOT NULL,

     CONSTRAINT "supervisory_positions_pkey" PRIMARY KEY ("id"),
     CONSTRAINT "supervisory_positions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE
   );
 `);
    await tx.$executeRawUnsafe(`
    CREATE TYPE "${schemaName}"."JenisSimpanan" AS ENUM ('POKOK', 'WAJIB', 'SUKARELA');
  `);
    await tx.$executeRawUnsafe(`
    CREATE TYPE "${schemaName}"."TipeTransaksiSimpanan" AS ENUM ('SETORAN', 'PENARIKAN');
  `);

    await tx.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}".simpanan_transaksi (
      "id" TEXT NOT NULL,
      "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "nomor_bukti" TEXT,
      "uraian" TEXT NOT NULL,
      "jenis" "${schemaName}"."JenisSimpanan" NOT NULL,
      "tipe" "${schemaName}"."TipeTransaksiSimpanan" NOT NULL,
      "jumlah" DOUBLE PRECISION NOT NULL,
      "member_id" TEXT NOT NULL,
      "user_id" TEXT, -- ID Pengurus yg mencatat
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "simpanan_transaksi_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "simpanan_transaksi_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "simpanan_transaksi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);

    await tx.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}".simpanan_saldo (
      "id" TEXT NOT NULL,
      "saldo_pokok" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "saldo_wajib" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "saldo_sukarela" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "member_id" TEXT NOT NULL,
      "last_updated_at" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "simpanan_saldo_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "simpanan_saldo_member_id_key" UNIQUE ("member_id"),
      CONSTRAINT "simpanan_saldo_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);
    // Tabel Pinjaman (Loans)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".loans (
        "id" TEXT NOT NULL,
        "loan_number" TEXT NOT NULL,
        "member_id" TEXT NOT NULL,
        "loan_amount" DOUBLE PRECISION NOT NULL,
        "interest_rate" DOUBLE PRECISION NOT NULL,
        "loan_date" TIMESTAMP(3) NOT NULL,
        "term_months" INTEGER NOT NULL,
        "due_date" TIMESTAMP(3) NOT NULL,
        "purpose" TEXT,
        "agreement_number" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "paid_off_date" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "loans_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    await tx.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "loans_loan_number_key" ON "${schemaName}"."loans"("loan_number");
    `);

    // Tabel Angsuran Pinjaman (Loan Installments)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".loan_installments (
        "id" TEXT NOT NULL,
        "loan_id" TEXT NOT NULL,
        "installment_number" INTEGER NOT NULL,
        "due_date" TIMESTAMP(3) NOT NULL,
        "payment_date" TIMESTAMP(3),
        "principal_amount" DOUBLE PRECISION NOT NULL,
        "interest_amount" DOUBLE PRECISION NOT NULL,
        "total_amount" DOUBLE PRECISION NOT NULL,
        "amount_paid" DOUBLE PRECISION,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "notes" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "loan_installments_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "loan_installments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "${schemaName}"."loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    // Enum Kondisi Inventaris
    await tx.$executeRawUnsafe(`
      CREATE TYPE "${schemaName}"."InventoryCondition" AS ENUM ('BAIK', 'PERLU_PERBAIKAN', 'RUSAK');
    `);

    // Tabel Inventaris (Inventory Items)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".inventory_items (
        "id" TEXT NOT NULL,
        "item_code" TEXT NOT NULL,
        "item_name" TEXT NOT NULL,
        "purchase_date" TIMESTAMP(3) NOT NULL,
        "quantity" INTEGER NOT NULL,
        "unit_price" DOUBLE PRECISION NOT NULL,
        "total_value" DOUBLE PRECISION NOT NULL,
        "technical_life_span" INTEGER,
        "economic_life_span" INTEGER,
        "condition" "${schemaName}"."InventoryCondition" NOT NULL DEFAULT 'BAIK',
        "location" TEXT,
        "notes" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
      );
    `);
    await tx.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "inventory_items_item_code_key" ON "${schemaName}"."inventory_items"("item_code");
    `);
    // Tabel Notulen Rapat Anggota (Member Meeting Notes)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".member_meeting_notes (
        "id" TEXT NOT NULL,
        "meeting_date" TIMESTAMP(3) NOT NULL,
        "location" TEXT NOT NULL,
        "meeting_type" TEXT NOT NULL,
        "total_members" INTEGER NOT NULL,
        "members_present" INTEGER NOT NULL,
        "leader" TEXT NOT NULL,
        "attendees" TEXT,
        "agenda_and_decision" TEXT NOT NULL,
        "document_url" TEXT,
        "notulis" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "member_meeting_notes_pkey" PRIMARY KEY ("id")
      );
    `);
    // Tabel Notulen Rapat Pengurus (Board Meeting Notes - Modul 08)
    await tx.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}".board_meeting_notes (
      "id" TEXT NOT NULL,
      "meeting_date" TIMESTAMP(3) NOT NULL,        -- Kolom 1
      "location" TEXT NOT NULL,                    -- Kolom 2
      "meeting_type" TEXT NOT NULL,                -- Kolom 3
      "total_board" INTEGER NOT NULL,              -- Kolom 4
      "board_present" INTEGER NOT NULL,            -- Kolom 5
      "leader" TEXT NOT NULL,                      -- Kolom 6
      "attendees" TEXT,                            -- Kolom 7 (Opsional)
      "agenda_and_decision" TEXT NOT NULL,         -- Kolom 8
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "board_meeting_notes_pkey" PRIMARY KEY ("id")
    );
  `);
    // Tabel Notulen Rapat Pengawas (Supervisory Meeting Notes - Modul 09)
    await tx.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}".supervisory_meeting_notes (
      "id" TEXT NOT NULL,
      "meeting_date" TIMESTAMP(3) NOT NULL,        
      "location" TEXT NOT NULL,                   
      "meeting_type" TEXT NOT NULL,                
      "total_supervisory" INTEGER NOT NULL,       
      "supervisory_present" INTEGER NOT NULL,     
      "leader" TEXT NOT NULL,                     
      "attendees" TEXT,                           
      "agenda_and_decision" TEXT NOT NULL,         
      "document_url" TEXT,                       
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "supervisory_meeting_notes_pkey" PRIMARY KEY ("id")
    );
  `);
    await tx.$executeRawUnsafe(`
   CREATE TABLE "${schemaName}".employees (
     "id" TEXT NOT NULL,
     "employee_number" SERIAL NOT NULL,
     "full_name" TEXT NOT NULL,
     "place_of_birth" TEXT NOT NULL,
     "date_of_birth" TIMESTAMP(3) NOT NULL,
     "gender" TEXT NOT NULL CHECK ("gender" IN ('MALE', 'FEMALE')),
     "address" TEXT NOT NULL,
     "hire_date" TIMESTAMP(3) NOT NULL,
     "position" TEXT NOT NULL,
     "notes" TEXT,
     "approved_by_pengurus_id" TEXT,
     "approved_by_ketua_id" TEXT,
     "ketua_approval_date" TIMESTAMP(3),
     "termination_date" TIMESTAMP(3),
     "termination_reason" TEXT,
     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updated_at" TIMESTAMP(3) NOT NULL,

     CONSTRAINT "employees_pkey" PRIMARY KEY ("id"),
     -- Definisikan Foreign Key Constraints
     CONSTRAINT "employees_approved_by_pengurus_id_fkey" FOREIGN KEY ("approved_by_pengurus_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
     CONSTRAINT "employees_approved_by_ketua_id_fkey" FOREIGN KEY ("approved_by_ketua_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
   );
 `);
    // Buku Tamu
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".guest_books (
        "id" TEXT NOT NULL,
        "entry_number" SERIAL NOT NULL,                     -- Kolom 1: NO URUT
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Kolom 2: TANGGAL
        "guest_name" TEXT NOT NULL,                         -- Kolom 3: NAMA TAMU
        "origin" TEXT NOT NULL,                             -- Kolom 4: INSTANSI / ALAMAT
        "meet_with" TEXT,                                   -- Kolom 5: BERTEMU DENGAN SIAPA (Opsional)
        "purpose" TEXT NOT NULL,                            -- Kolom 6: MAKSUD DAN TUJUAN
        "signature_url" TEXT,                               -- Kolom 7: TANDA TANGAN (Opsional)
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
    
        CONSTRAINT "guest_books_pkey" PRIMARY KEY ("id")
      );
    `);
    // Saran Anggota (Modul 12)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".member_suggestions (
        "id" TEXT NOT NULL,
        "suggestion_number" SERIAL NOT NULL,                      -- Kolom 1: NO URUT
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- Kolom 2: TANGGAL
        "member_id" TEXT NOT NULL,                                -- Kolom 3 & 4 (Relasi)
        "suggestion" TEXT NOT NULL,                               -- Kolom 5: ISI SARAN
        "response" TEXT,                                          -- Kolom 7: TANGGAPAN PENGURUS (Opsional)
        "response_by_user_id" TEXT,                               -- Kolom 8 (Relasi ke User Pengurus)
        "response_at" TIMESTAMP(3),                               -- Tanggal ditanggapi
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
    
        CONSTRAINT "member_suggestions_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "member_suggestions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "member_suggestions_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    // Buku Saran Pengawas (Modul 13)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".supervisory_suggestions (
        "id" TEXT NOT NULL,
        "suggestion_number" SERIAL NOT NULL,                      -- Kolom 1: NO URUT
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- Kolom 2: TANGGAL
        "supervisor_member_id" TEXT NOT NULL,                     -- Kolom 3 (Relasi ke Member)
        "suggestion" TEXT NOT NULL,                               -- Kolom 4: ISI SARAN
        "response" TEXT,                                          -- Kolom 7: TANGGAPAN PENGURUS (Opsional)
        "response_by_user_id" TEXT,                               -- Kolom 6 (Relasi ke User Pengurus)
        "response_at" TIMESTAMP(3),                               -- Tanggal ditanggapi
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
    
        CONSTRAINT "supervisory_suggestions_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "supervisory_suggestions_supervisor_member_id_fkey" FOREIGN KEY ("supervisor_member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "supervisory_suggestions_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    // Anjuran Pejabat (Modul 14)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".official_recommendations (
        "id" TEXT NOT NULL,
        "entry_number" SERIAL NOT NULL,                     -- Kolom 1
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Kolom 2
        "official_name" TEXT NOT NULL,                        -- Kolom 3
        "official_position_and_address" TEXT NOT NULL,      -- Kolom 4
        "recommendation" TEXT NOT NULL,                       -- Kolom 5
        "document_url" TEXT,                        -- Kolom 6
        "response" TEXT,                                    -- Kolom 7
        "response_by_user_id" TEXT,                         -- Kolom 8
        "response_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
    
        CONSTRAINT "official_recommendations_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "official_recommendations_response_by_user_id_fkey" FOREIGN KEY ("response_by_user_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    // Catatn kejadian Penting (Modul 15)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".important_events (
        "id" TEXT NOT NULL,
        "entry_number" SERIAL NOT NULL,                     -- Kolom 1
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Kolom 2
        "description" TEXT NOT NULL,                        -- Kolom 3
        "resolution" TEXT,                                  -- Kolom 4
        "cause_and_notes" TEXT,                             -- Kolom 5
        "recorded_by_user_id" TEXT,                         -- Kolom 6
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "important_events_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "important_events_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "${schemaName}"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    //Agenda (Modul 16)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".agenda_expeditions (
        "id" TEXT NOT NULL,
        "entry_number" SERIAL NOT NULL,                     -- Kolom 1
        "letter_number" TEXT NOT NULL,                      -- Kolom 2 (Nomor)
        "letter_date" TIMESTAMP(3) NOT NULL,                -- Kolom 2 (Tanggal)
        "addressed_to" TEXT NOT NULL,                       -- Kolom 3
        "subject" TEXT NOT NULL,                            -- Kolom 4
        "notes" TEXT,                                       -- Kolom 5
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "agenda_expeditions_pkey" PRIMARY KEY ("id")
        -- Tidak ada foreign key di sini
      );
    `);
    // Tabel Password Reset Token
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".password_reset_tokens (
        "id" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "expires_at" TIMESTAMP(3) NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "password_reset_tokens_token_key" UNIQUE ("token"),
        CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "${schemaName}"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    // profile koperasi
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".cooperative_profile (
        "id" TEXT NOT NULL,
        "display_name" TEXT NOT NULL,
        "logo_url" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "website" TEXT,
        "address" TEXT,
        "description" TEXT,
        "operating_hours" TEXT,
        "map_coordinates" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "cooperative_profile_pkey" PRIMARY KEY ("id")
      );
    `);
    // Tabel Contact Messages (BARU)
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".contact_messages (
        "id" TEXT NOT NULL,
        "sender_name" TEXT NOT NULL,
        "sender_email" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
      );
    `);
    // Tabel Artikel (Berita)
    await tx.$executeRawUnsafe(`
      CREATE TYPE "${schemaName}"."ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
    `);
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".articles (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "excerpt" TEXT,
        "image_url" TEXT,
        "source_link" TEXT,
        "status" "${schemaName}"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
        "published_at" TIMESTAMP(3),
        "author_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "articles_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "articles_slug_key" UNIQUE ("slug"),
        CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "${schemaName}"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    // Tambahkan index pada slug untuk pencarian lebih cepat (opsional tapi bagus)
    await tx.$executeRawUnsafe(`
        CREATE INDEX "articles_slug_idx" ON "${schemaName}"."articles"("slug");
    `);
    // Tambahkan index pada status untuk filter lebih cepat (opsional tapi bagus)
    await tx.$executeRawUnsafe(`
        CREATE INDEX "articles_status_idx" ON "${schemaName}"."articles"("status");
    `);
    // Tabel Kategori Produk
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".product_categories (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "product_categories_name_key" UNIQUE ("name"),
        CONSTRAINT "product_categories_slug_key" UNIQUE ("slug")
      );
    `);

    // Index pada slug (opsional tapi bagus)
    await tx.$executeRawUnsafe(`
        CREATE INDEX "product_categories_slug_idx" ON "${schemaName}"."product_categories"("slug");
    `);
    // Tabel Produk
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".products (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "price" INTEGER NOT NULL, -- Simpan sebagai integer
        "unit" TEXT,
        "sku" TEXT,
        "image_url" TEXT,
        "is_available" BOOLEAN NOT NULL DEFAULT true,
        "category_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "products_slug_key" UNIQUE ("slug"),
        CONSTRAINT "products_sku_key" UNIQUE ("sku"), -- Constraint unik untuk SKU
        CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "${schemaName}"."product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE -- ON DELETE RESTRICT mencegah kategori dihapus jika masih ada produk
      );
    `);

    // Index pada slug produk (opsional tapi bagus)
    await tx.$executeRawUnsafe(`
        CREATE INDEX "products_slug_idx" ON "${schemaName}"."products"("slug");
    `);
    // Index pada category_id untuk filter (opsional tapi bagus)
    await tx.$executeRawUnsafe(`
        CREATE INDEX "products_category_id_idx" ON "${schemaName}"."products"("category_id");
    `);
    // Index pada is_available untuk filter (opsional tapi bagus)
    await tx.$executeRawUnsafe(`
        CREATE INDEX "products_is_available_idx" ON "${schemaName}"."products"("is_available");
    `);
    // Tabel Item Galeri Foto
    await tx.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".gallery_items (
        "id" TEXT NOT NULL,
        "image_url" TEXT NOT NULL,
        "description" TEXT,
        "order" INTEGER,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
      );
    `);

    // Index pada createdAt atau order (opsional, untuk sorting)
    await tx.$executeRawUnsafe(`
        CREATE INDEX "gallery_items_created_at_idx" ON "${schemaName}"."gallery_items"("created_at" DESC);
    `);
    await tx.$executeRawUnsafe(`
        CREATE INDEX "gallery_items_order_idx" ON "${schemaName}"."gallery_items"("order" ASC NULLS LAST); -- Urutkan berdasarkan order, NULLS di akhir
    `);
  }

  /**
   * Helper untuk membuat baris data awal (singleton) untuk profil koperasi.
   * Dipanggil dari activateTenant dan create.
   */
  private async createInitialCooperativeProfile(
    tx: Prisma.TransactionClient,
    schemaName: string,
    // Data awal diambil dari DTO registrasi
    initialDisplayName: string,
    initialAddress: string,
    initialEmail: string,
    initialPhone: string | null,
    initialOperatingHours?: string | null,
    initialMapCoordinates?: string | null,
  ): Promise<void> {
    console.log(
      `[TenantService] Membuat profil koperasi awal untuk ${schemaName}`,
    );
    const profileId = uuidv4(); // ID unik untuk baris profil

    try {
      const query = `
        INSERT INTO "${schemaName}".cooperative_profile (
          id, display_name, address, email, phone, operating_hours, map_coordinates, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `;

      await tx.$executeRawUnsafe(
        query,
        profileId,
        initialDisplayName,
        initialAddress,
        initialEmail,
        initialPhone,
        initialOperatingHours ?? null, // Masukkan nilai atau null
        initialMapCoordinates ?? null,
        new Date(),
      );
    } catch (error) {
      console.error(
        `[TenantService] Gagal membuat cooperative_profile awal:`,
        error,
      );
      // Jangan gagalkan seluruh transaksi, tapi log errornya
      throw new InternalServerErrorException(
        'Gagal inisialisasi profil koperasi.',
      );
    }
  }

  private async createFirstAdminMemberAndPosition(
    tx: Prisma.TransactionClient,
    schemaName: string,
    adminDetails: {
      fullName: string;
      email: string;
      hashedPassword?: string;
      passwordHash?: string;
      nik: string;
      gender: Gender;
      placeOfBirth: string;
      dateOfBirth: Date;
      occupation: string;
      address: string;
    },
  ): Promise<{ userId: string; memberId: string }> {
    console.log(
      `[TenantService] Mencoba membuat admin, member, dan posisi awal untuk tenant ${schemaName} (via Raw SQL)`,
    );

    // 1. Dapatkan RoleId 'Pengurus' (Menggunakan Raw SQL)
    let pengurusRoleId: number;
    try {
      const query = `SELECT id FROM "${schemaName}".roles WHERE name = 'Pengurus' LIMIT 1;`;
      const pengurusRoleResult =
        await tx.$queryRawUnsafe<{ id: number }[]>(query);
      if (!pengurusRoleResult || pengurusRoleResult.length === 0) {
        throw new InternalServerErrorException(
          "KRITIS: Role 'Pengurus' tidak ditemukan.",
        );
      }
      pengurusRoleId = pengurusRoleResult[0].id;
      console.log(
        `[TenantService] Role 'Pengurus' ditemukan dengan ID: ${pengurusRoleId}`,
      );
    } catch (error: unknown) {
      console.error(
        `[TenantService] Gagal query Role 'Pengurus' di schema '${schemaName}':`,
        error,
      );
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        'Gagal memverifikasi role sistem.',
      );
    }

    // 2. Buat User Pengurus (Menggunakan Raw SQL)
    const newUserId = uuidv4(); // Buat ID unik
    const passwordHash =
      adminDetails.hashedPassword || adminDetails.passwordHash || '';

    try {
      const query = `
        INSERT INTO "${schemaName}".users (id, full_name, email, password_hash, role_id, status)
        VALUES ($1, $2, $3, $4, $5, 'active');
      `;
      // Gunakan parameter $1, $2, dst. untuk keamanan
      await tx.$executeRawUnsafe(
        query,
        newUserId,
        adminDetails.fullName,
        adminDetails.email,
        passwordHash,
        pengurusRoleId,
      );
      console.log(
        `[TenantService] User Pengurus ${newUserId} berhasil dibuat.`,
      );
    } catch (error: unknown) {
      console.error('[TenantService] Gagal membuat User Pengurus awal:', error);
      // Cek P2002 untuk unique constraint (email)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Email ${adminDetails.email} sudah digunakan.`,
        );
      }
      throw new InternalServerErrorException(
        'Gagal membuat akun pengurus awal.',
      );
    }

    // 3. Buat Member yang bersesuaian (Menggunakan Raw SQL)
    const memberNumber = `PGRS-${Date.now().toString().slice(-6)}`;

    try {
      const query = `
        INSERT INTO "${schemaName}".members (
          id, member_number, full_name, nik, place_of_birth, 
          date_of_birth, gender, occupation, address, 
          join_date, status, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 
          $10, 'ACTIVE', $11, $12
        );
      `;

      const now = new Date(); // Gunakan timestamp yang sama untuk join, create, update

      await tx.$executeRawUnsafe(
        query,
        newUserId, // $1: id
        memberNumber, // $2: member_number
        adminDetails.fullName, // $3: full_name
        adminDetails.nik, // $4: nik
        adminDetails.placeOfBirth, // $5: place_of_birth
        adminDetails.dateOfBirth, // $6: date_of_birth
        adminDetails.gender, // $7: gender
        adminDetails.occupation, // $8: occupation
        adminDetails.address, // $9: address
        now, // $10: join_date
        now, // $11: created_at
        now, // $12: updated_at
      );
      console.log(
        `[TenantService] Member ${newUserId} (untuk User) berhasil dibuat.`,
      );
    } catch (error: unknown) {
      console.error(
        `[TenantService] Gagal membuat Member untuk Pengurus awal (${newUserId}):`,
        error,
      );
      // Cek P2002 untuk unique constraint (nik)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `NIK ${adminDetails.nik} sudah terdaftar sebagai anggota.`,
        );
      }
      throw new InternalServerErrorException(
        'Gagal membuat data keanggotaan pengurus awal.',
      );
    }

    // 4. Buat Jabatan Awal (misal: Ketua) (Menggunakan Raw SQL)
    const newPositionId = uuidv4(); // ID untuk tabel board_positions

    try {
      const query = `
        INSERT INTO "${schemaName}".board_positions (
          id, member_id, jabatan, tanggal_diangkat, tanggal_berhenti,
          created_at, updated_at
        )
        VALUES (
          $1, $2, 'Ketua', $3, null,
          $4, $5
        );
      `;

      const now = new Date(); // Waktu saat ini

      await tx.$executeRawUnsafe(
        query,
        newPositionId, // $1: id
        newUserId, // $2: member_id
        now, // $3: tanggal_diangkat
        now, // $4: created_at
        now, // $5: updated_at
      );
      console.log(
        `[TenantService] Posisi 'Ketua' untuk Member ${newUserId} berhasil dibuat.`,
      );
    } catch (error: unknown) {
      console.error(
        `[TenantService] Gagal membuat BoardPosition awal untuk Member ${newUserId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Gagal menetapkan jabatan awal pengurus.',
      );
    }

    return { userId: newUserId, memberId: newUserId };
  }

  async activateTenant(tenantId: string): Promise<void> {
    console.log(`[TenantService] Mengaktifkan tenant dengan ID: ${tenantId}`);
    await this.prisma
      .$transaction(
        async (tx) => {
          const tenant = await tx.tenant.findFirst({
            where: { id: tenantId, status: TenantStatus.PENDING },
          });

          if (!tenant) {
            console.warn(
              `[TenantService] Aktivasi gagal: Tenant ${tenantId} tidak ditemukan atau tidak PENDING.`,
            );
            throw new NotFoundException(
              `Tenant dengan ID ${tenantId} tidak ditemukan atau sudah diproses.`,
            );
          }

          // --- TAMBAHKAN TYPE EXPLISIT DI SINI ---
          let registrationData: TenantRegistration;
          // ----------------------------------------
          try {
            registrationData = await tx.tenantRegistration.findUniqueOrThrow({
              where: { tenantId: tenant.id },
            });
          } catch (error) {
            console.error(
              `[TenantService] Data pendaftaran untuk tenant ${tenantId} tidak ditemukan!`,
              error,
            );
            throw new InternalServerErrorException(
              `Data pendaftaran krusial untuk tenant ${tenantId} tidak ditemukan.`,
            );
          }

          await tx.tenant.update({
            where: { id: tenantId },
            data: { status: TenantStatus.ACTIVE },
          });
          console.log(
            `[TenantService] Status tenant ${tenantId} diubah menjadi ACTIVE.`,
          );

          await tx.$executeRawUnsafe(
            `CREATE SCHEMA IF NOT EXISTS "${tenant.schemaName}";`,
          );
          console.log(
            `[TenantService] Skema "${tenant.schemaName}" dipastikan ada.`,
          );

          await this.createTenantTables(tx, tenant.schemaName);
          // Logging sudah ada di dalam createTenantTables

          // --- PERBAIKAN PEMANGGILAN FUNGSI ---
          // Siapkan data detail admin dari registrationData
          const adminDetailsForHelper = {
            fullName: registrationData.picFullName, // <-- Diubah dari pic_full_name
            email: registrationData.email,
            hashedPassword: registrationData.hashedPassword,
            nik: registrationData.picNik, // <-- Diubah dari pic_nik
            gender: registrationData.picGender, // <-- Diubah dari pic_gender
            placeOfBirth: registrationData.picPlaceOfBirth, // <-- Diubah dari pic_place_of_birth
            dateOfBirth: registrationData.picDateOfBirth, // <-- Diubah dari pic_date_of_birth
            occupation: registrationData.picOccupation, // <-- Diubah dari pic_occupation
            address: registrationData.picAddress, // <-- Diubah dari pic_address
          };
          // Panggil fungsi helper dengan data LENGKAP
          await this.createFirstAdminMemberAndPosition(
            tx,
            tenant.schemaName,
            adminDetailsForHelper,
          );
          // --- AKHIR PERBAIKAN ---
          await this.createInitialCooperativeProfile(
            tx,
            tenant.schemaName,
            registrationData.cooperativeName,
            registrationData.alamatLengkap,
            registrationData.email, // Gunakan email PIC sebagai email publik awal
            registrationData.picPhoneNumber, // Gunakan no HP PIC sebagai no HP publik awal
          );
          console.log(
            `[TenantService] Tenant ${tenant.name} (${tenantId}) berhasil diaktifkan (setup database selesai).`,
          );
        },
        { timeout: 25000, maxWait: 10000 },
      )
      .catch((error) => {
        console.error(
          `[TenantService] Terjadi error saat aktivasi (setup database) tenant ${tenantId}:`,
          error,
        );
        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException ||
          error instanceof InternalServerErrorException
        ) {
          throw error;
        }
        throw new InternalServerErrorException(
          `Aktivasi tenant gagal karena kesalahan internal.`,
        );
      });
  }

  findAll() {
    return this.prisma.tenant.findMany();
  }
}
