import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  private readonly prisma = new PrismaClient();

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
            data: { name, subdomain, schemaName },
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

  findAll() {
    return this.prisma.tenant.findMany();
  }
}
