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
@Injectable()
export class TenantsService {
  private readonly prisma = new PrismaClient();

  constructor(
    @Inject(forwardRef(() => MidtransService))
    private midtransService: MidtransService,
  ) {}

  findPending() {
    return this.prisma.tenant.findMany({
      where: { status: 'PENDING' },
    });
  }
  async approve(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, status: 'PENDING' },
    });

    if (!tenant) {
      throw new NotFoundException(
        'Tenant tidak ditemukan atau sudah disetujui.',
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
    await this.activateTenant(tenantId);

    return {
      message: 'Koperasi telah berhasil diaktifkan secara manual.',
      tenantId: tenant.id,
    };
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
        "id" TEXT NOT NULL,
        "member_number" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
        "nik" TEXT NOT NULL,
        "place_of_birth" TEXT NOT NULL,
        "date_of_birth" TIMESTAMP(3) NOT NULL,
        "gender" TEXT NOT NULL CHECK ("gender" IN ('MALE', 'FEMALE')),
        "occupation" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "fingerprint_url" TEXT,
        "signature_url" TEXT,
        "resignation_request_date" TIMESTAMP(3),
        "termination_date" TIMESTAMP(3),
        "termination_reason" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "members_pkey" PRIMARY KEY ("id")
      );
    `);
    await tx.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "members_member_number_key" ON "${schemaName}"."members"("member_number");
    `);
    await tx.$executeRawUnsafe(`
      CREATE UNIQUE INDEX "members_nik_key" ON "${schemaName}"."members"("nik"); -- <--- TAMBAHKAN BARIS INI JIKA BELUM ADA
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
     "fingerprint_url" TEXT,
     "signature_url" TEXT,
     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updated_at" TIMESTAMP(3) NOT NULL,

     CONSTRAINT "board_positions_pkey" PRIMARY KEY ("id"),
     CONSTRAINT "board_positions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "${schemaName}"."members"("id") ON DELETE RESTRICT ON UPDATE CASCADE
   );
 `);
    // Opsional: Tambahkan index jika diperlukan, misal pada member_id
    // await tx.$executeRawUnsafe(`CREATE INDEX "board_positions_member_id_idx" ON "${schemaName}"."board_positions"("member_id");`);
    await tx.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}".supervisory_positions (
     "id" TEXT NOT NULL,
     "jabatan" TEXT NOT NULL,
     "tanggal_diangkat" TIMESTAMP(3) NOT NULL,
     "tanggal_berhenti" TIMESTAMP(3),
     "alasan_berhenti" TEXT,
     "member_id" TEXT NOT NULL,
     "fingerprint_url" TEXT,
     "signature_url" TEXT,
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
      "signature_url" TEXT,                        -- Kolom 9 (Opsional)
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
      "signature_url" TEXT,                       
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
     "signature_url" TEXT,
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
        "signature_url" TEXT,                                     -- Kolom 6: TANDA TANGAN (Opsional)
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
        "supervisor_signature_url" TEXT,                          -- Kolom 5: TANDA TANGAN (Opsional)
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
        "official_signature_url" TEXT,                        -- Kolom 6
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

  async activateTenant(tenantId: string) {
    console.log(`[TenantService] Mengaktifkan tenant dengan ID: ${tenantId}`);
    return this.prisma
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
            fullName: registrationData.fullName,
            email: registrationData.email,
            hashedPassword: registrationData.hashedPassword, // Ambil HASHED password
            nik: registrationData.nik,
            gender: registrationData.gender,
            placeOfBirth: registrationData.city || 'Data Belum Lengkap', // Fallback
            dateOfBirth: new Date(), // Fallback -> Idealnya ada di registrasi tenant
            occupation: 'Pengurus Koperasi', // Default
            address:
              `${registrationData.village || ''}, ${registrationData.district || ''}, ${registrationData.city || ''}`.trim() ||
              'Data Belum Lengkap',
          };
          await this.createFirstAdminMemberAndPosition(
            // <-- Nama fungsi baru
            tx,
            tenant.schemaName,
            adminDetailsForHelper, // <-- Kirim data yang sudah disiapkan
          );
          // --- AKHIR PERBAIKAN ---

          console.log(
            `[TenantService] Tenant ${tenant.name} (${tenantId}) berhasil diaktifkan sepenuhnya!`,
          );
          return {
            message: `Tenant ${tenant.name} berhasil diaktifkan.`,
            tenantId: tenant.id,
          };
        },
        { timeout: 25000, maxWait: 10000 },
      )
      .catch((error) => {
        console.error(
          `[TenantService] Terjadi error saat aktivasi tenant ${tenantId}:`,
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
