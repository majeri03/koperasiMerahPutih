import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { MidtransService } from 'src/midtrans/midtrans.service';

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
    const { name, subdomain, adminName, adminEmail, adminPassword } =
      createTenantDto;
    const schemaName = `tenant_${subdomain}`;

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Subdomain sudah digunakan.');
    }

    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const newTenant = await tx.tenant.create({
            data: { name, subdomain, schemaName, status: 'ACTIVE' },
          });

          await tx.$executeRawUnsafe(
            `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`,
          );

          await this.createTenantTables(tx, schemaName);

          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash(adminPassword, salt);

          await this.createFirstAdmin(
            tx,
            schemaName,
            adminName,
            adminEmail,
            hashedPassword,
          );

          return {
            message: 'Koperasi berhasil dibuat beserta akun pengurus pertama.',
            tenant: newTenant,
          };
        },
      );
    } catch (error) {
      console.error('Failed to create tenant:', error);
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
      INSERT INTO "${schemaName}".roles (name) VALUES ('Pengurus'), ('Anggota');
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
      CREATE TABLE "${schemaName}".members (
        "id" TEXT NOT NULL,
        "member_number" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
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
      CREATE TABLE "${schemaName}".board_positions (
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
  }

  private async createFirstAdmin(
    tx: Prisma.TransactionClient,
    schemaName: string,
    fullName: string,
    email: string,
    passwordHash: string,
  ) {
    await tx.$executeRawUnsafe(`
      INSERT INTO "${schemaName}".users (id, full_name, email, password_hash, role_id)
      VALUES (
        gen_random_uuid(),
        '${fullName.replace(/'/g, "''")}', 
        '${email.replace(/'/g, "''")}', 
        '${passwordHash.replace(/'/g, "''")}', 
        (SELECT id FROM "${schemaName}".roles WHERE name = 'Pengurus')
      );
    `);
  }

  async activateTenant(tenantId: string) {
    console.log(`Mengaktifkan tenant dengan ID: ${tenantId}`);

    return this.prisma.$transaction(
      async (tx) => {
        const tenant = await tx.tenant.findFirst({
          where: { id: tenantId, status: 'PENDING' },
        });

        if (!tenant) {
          console.log(
            `Aktivasi gagal: Tenant ${tenantId} tidak ditemukan atau sudah aktif.`,
          );
          return;
        }
        const registrationData = await tx.tenantRegistration.findUnique({
          where: { tenantId: tenant.id },
        });
        if (!registrationData) {
          throw new InternalServerErrorException(
            `Data pendaftaran untuk tenant ${tenantId} tidak ditemukan.`,
          );
        }
        await tx.tenant.update({
          where: { id: tenantId },
          data: { status: 'ACTIVE' },
        });

        await tx.$executeRawUnsafe(
          `CREATE SCHEMA IF NOT EXISTS "${tenant.schemaName}";`,
        );

        await this.createTenantTables(tx, tenant.schemaName);

        await this.createFirstAdmin(
          tx,
          tenant.schemaName,
          registrationData.fullName,
          registrationData.email,
          registrationData.hashedPassword,
        );

        console.log(`Tenant ${tenant.name} berhasil diaktifkan!`);
      },
      {
        timeout: 15000,
      },
    );
  }

  findAll() {
    return this.prisma.tenant.findMany();
  }
}
