// backend/src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Jika tidak ada decorator @Roles, akses diizinkan
    }

    const { user }: { user: JwtPayloadDto } = context
      .switchToHttp()
      .getRequest();

    // Cek apakah peran pengguna ada di dalam daftar peran yang diizinkan
    return requiredRoles.some((role) => user.role === (role as string));
  }
}
