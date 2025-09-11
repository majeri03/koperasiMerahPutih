import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const tenantId = request.tenantId;

    if (tenantId) {
      throw new ForbiddenException(
        'Endpoint ini hanya bisa diakses oleh Super Admin.',
      );
    }

    return true;
  }
}
