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

    const dummyAdminDetails = {
      firstName: 'Admin Pendaftar',
      email: 'pendaftar@example.com',
    };
    const registrationFee = 100000;
    const transaction = await this.midtransService.createTransaction(
      tenant.id,
      registrationFee,
      dummyAdminDetails,
    );
    console.log(`Memulai proses pembayaran untuk tenant: ${tenant.name}`);

    return {
      message: 'Tautan pembayaran berhasil dibuat.',
      paymentUrl: transaction.redirect_url,
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
