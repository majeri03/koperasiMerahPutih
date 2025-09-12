import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PublicService {
  private readonly prisma = new PrismaClient();

  async register(registerTenantDto: RegisterTenantDto) {
    const {
      subdomain,
      email,
      nik,
      phoneNumber,
      password,
      cooperativeName,
      ...registrationDetails
    } = registerTenantDto;

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Nama subdomain sudah digunakan.');
    }

    const existingRegistration = await this.prisma.tenantRegistration.findFirst(
      {
        where: { OR: [{ email }, { nik }, { phoneNumber }] },
      },
    );
    if (existingRegistration) {
      throw new ConflictException('Email, NIK, atau Nomor HP sudah terdaftar.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

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

        await tx.tenantRegistration.create({
          data: {
            ...registrationDetails,
            cooperativeName,
            email,
            nik,
            phoneNumber,
            hashedPassword,
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
