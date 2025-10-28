import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  mixin,
  Type,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

// Definisikan tipe untuk request agar bisa akses user dengan aman
interface RequestWithSuperAdmin extends Request {
  user?: { sub: string; email: string }; // Payload dari SuperAdminJwtStrategy
}

@Injectable()
export class AuthenticatedSuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: RequestWithSuperAdmin = context.switchToHttp().getRequest();

    // 1. Cek Domain (Harus domain utama)
    const tenantId = request.tenantId;
    if (tenantId) {
      console.log(
        '[AuthenticatedSuperAdminGuard] Access denied: Request has tenantId.',
      );
      throw new ForbiddenException(
        'Endpoint ini hanya bisa diakses oleh Super Admin dari domain utama.',
      );
    }

    // 2. Cek Autentikasi (Apakah user (super admin) sudah ada di request?)
    //    Strategi SuperAdminJwtStrategy seharusnya sudah menempelkan 'user' jika token valid.
    if (!request.user || !request.user.sub) {
      console.log(
        '[AuthenticatedSuperAdminGuard] Access denied: User (Super Admin) not authenticated.',
      );
      // Gunakan UnauthorizedException jika masalahnya adalah belum login
      throw new UnauthorizedException('Super Admin not authenticated.');
    }

    // Jika lolos kedua cek
    console.log('[AuthenticatedSuperAdminGuard] Access granted.');
    return true;
  }
}

// --- FUNGSI UNTUK MENGGABUNGKAN GUARD ---
// Fungsi ini akan membuat guard baru yang pertama menjalankan AuthGuard('superadmin-jwt')
// lalu menjalankan AuthenticatedSuperAdminGuard
export function CombinedSuperAdminGuard(): Type<CanActivate> {
  class CombinedGuard
    extends mixin(AuthGuard('superadmin-jwt'))
    implements CanActivate
  {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      // 1. Jalankan AuthGuard('superadmin-jwt') dulu
      // Jika token tidak valid atau tidak ada, ini akan otomatis throw UnauthorizedException
      const canActivateJwt = await super.canActivate(context);
      if (!canActivateJwt) {
        return false; // Seharusnya tidak sampai sini karena AuthGuard throw error
      }

      // 2. Jika JWT valid, jalankan pengecekan domain (dan pastikan user ada)
      const domainAndUserGuard = new AuthenticatedSuperAdminGuard();
      return domainAndUserGuard.canActivate(context);
    }
  }
  return CombinedGuard;
}

// @Injectable()
// export class SuperAdminGuard implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request: Request = context.switchToHttp().getRequest();

//     const tenantId = request.tenantId;

//     if (tenantId) {
//       throw new ForbiddenException(
//         'Endpoint ini hanya bisa diakses oleh Super Admin.',
//       );
//     }

//     return true;
//   }
// }
