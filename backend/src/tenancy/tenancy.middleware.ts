import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.hostname; // e.g., 'localhost' or 'majubersama.localhost'

    // Cek secara eksplisit apakah hostname adalah domain utama Super Admin
    const isSuperAdminDomain = ['localhost', '127.0.0.1'].includes(host);

    if (isSuperAdminDomain) {
      // Jika ini adalah domain Super Admin, pastikan TIDAK ADA tenantId
      req.tenantId = undefined;
      console.log(
        `[TenancyMiddleware] Super Admin access confirmed. No tenantId set.`,
      );
    } else {
      // Jika bukan, maka ini adalah subdomain tenant
      const subdomain = host.split('.')[0];
      req.tenantId = subdomain;
      console.log(
        `[TenancyMiddleware] Tenant access confirmed for: ${subdomain}`,
      );
    }

    next();
  }
}
