import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.hostname;

    const subdomain = host.split('.')[0];
    if (subdomain !== 'localhost') {
      req.tenantId = subdomain;
      console.log(`[TenancyMiddleware] Tenant accessed: ${subdomain}`);
    } else {
      console.log(`[TenancyMiddleware] No tenant (localhost access)`);
    }

    req['tenantId'] = subdomain;

    console.log(`[TenancyMiddleware] Tenant accessed: ${subdomain}`);
    next();
  }
}
