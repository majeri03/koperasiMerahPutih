// backend/src/tenancy/tenancy.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { URL } from 'url'; // Pastikan ini di-import

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.hostname;
    const origin = req.headers.origin; // Ambil header Origin

    // Logging tambahan untuk debugging
    console.log(`[TenancyMiddleware] Host: ${host}, Origin: ${origin}`);

    let tenantId: string | undefined = undefined;
    const backendRootDomains = ['localhost', '127.0.0.1']; // Domain root backend

    // Prioritaskan deteksi dari Origin jika ada dan valid
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.hostname; // e.g., majujaya.localhost
        const originHostParts = originHost.split('.');

        // Cek jika originHost BUKAN root domain backend DAN memiliki bagian subdomain
        if (!backendRootDomains.includes(originHost) && originHostParts.length > 1) {
          // Cek lagi apakah bagian pertama BUKAN root domain (untuk kasus localhost.localhost, dll.)
          if (!backendRootDomains.includes(originHostParts[0])) {
              tenantId = originHostParts[0];
              console.log(`[TenancyMiddleware] Tenant identified from Origin: ${tenantId}`);
          }
        }
      } catch (e) {
        console.warn('[TenancyMiddleware] Failed to parse Origin header:', origin);
      }
    }

    // Jika tidak terdeteksi dari Origin, coba dari Host (seperti versi lama)
    // Ini berguna jika akses API langsung (misal via Postman) dengan Host header di-set
    if (!tenantId) {
        const hostParts = host.split('.');
        if (!backendRootDomains.includes(host) && hostParts.length > 1) {
             if (!backendRootDomains.includes(hostParts[0])) {
                tenantId = hostParts[0];
                console.log(`[TenancyMiddleware] Tenant identified from Host: ${tenantId}`);
             }
        }
    }

    // Set req.tenantId
    req.tenantId = tenantId;

    if (!req.tenantId) {
      console.log(`[TenancyMiddleware] No tenantId identified. Assuming Super Admin or public access.`);
    }

    next();
  }
}