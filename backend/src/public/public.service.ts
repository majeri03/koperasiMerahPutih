import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@Injectable()
export class PublicService {
  // Service ini, seperti TenantsService, hanya berinteraksi dengan skema 'public'
  private readonly prisma = new PrismaClient();

  async register(registerTenantDto: RegisterTenantDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cooperativeName, subdomain, adminName, adminEmail, adminPassword } =
      registerTenantDto;

    // 1. Cek apakah subdomain sudah terdaftar (aktif atau pending)
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (existingTenant) {
      throw new ConflictException('Nama subdomain sudah digunakan.');
    }

    // 2. Simpan data pendaftar baru dengan status PENDING
    // Kita belum membuat skema atau user, hanya menyimpan datanya.
    // Kita akan menyimpan data admin di kolom lain untuk sementara.
    // (Penyempurnaan: idealnya data admin disimpan di tabel terpisah,
    // tapi untuk sekarang ini cukup sederhana)
    const pendingTenant = await this.prisma.tenant.create({
      data: {
        name: cooperativeName,
        subdomain,
        schemaName: `tenant_${subdomain}`, // Kita siapkan nama skemanya
        status: 'PENDING', // <-- Status diatur menjadi PENDING
      },
    });

    // TODO: Simpan detail admin (adminName, adminEmail, adminPassword)
    // ke tabel terpisah yang berelasi dengan tenant, agar bisa digunakan
    // saat aktivasi nanti.

    return {
      message:
        'Pendaftaran berhasil. Silakan tunggu persetujuan dari Administrator.',
      tenantId: pendingTenant.id,
    };
  }
}
