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
      CREATE TABLE "${schemaName}".members (
        "id" TEXT NOT NULL,
        "member_number" TEXT NOT NULL,
        "full_name" TEXT NOT NULL,
        "place_of_birth" TEXT NOT NULL,
        "date_of_birth" TIMESTAMP(3) NOT NULL,
        "gender" "public"."Gender" NOT NULL,
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
