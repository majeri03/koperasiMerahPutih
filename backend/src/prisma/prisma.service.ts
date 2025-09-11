import {
  Injectable,
  Scope,
  Inject,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class PrismaService implements OnModuleDestroy {
  private readonly prismaPublic = new PrismaClient();
  private tenantClient: PrismaClient | null = null;

  constructor(@Inject(REQUEST) private request: Request) {}

  async getTenantClient(): Promise<PrismaClient> {
    if (this.tenantClient) {
      return this.tenantClient;
    }

    const tenantId = this.request.tenantId;
    if (!tenantId) {
      throw new Error(
        'Tenant ID not found in request. Make sure TenancyMiddleware is running.',
      );
    }

    const tenant = await this.prismaPublic.tenant.findUnique({
      where: { subdomain: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Koperasi dengan subdomain '${tenantId}' tidak ditemukan.`,
      );
    }
    if (tenant.status !== 'ACTIVE') {
      throw new NotFoundException(`Koperasi '${tenant.name}' tidak aktif.`);
    }

    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) {
      throw new Error('DATABASE_URL is not set in environment variables.');
    }

    // ===== PERBAIKAN DI SINI =====
    // Cek apakah URL sudah memiliki parameter. Jika ya, gunakan '&', jika tidak, gunakan '?'.
    const separator = originalUrl.includes('?') ? '&' : '?';
    const tenantUrl = `${originalUrl}${separator}schema=${tenant.schemaName}`;
    // =============================

    this.tenantClient = new PrismaClient({
      datasources: {
        db: {
          url: tenantUrl,
        },
      },
    });

    return this.tenantClient;
  }

  async onModuleDestroy() {
    await this.prismaPublic.$disconnect();
    if (this.tenantClient) {
      await this.tenantClient.$disconnect();
    }
  }
}
