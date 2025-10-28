// src/admin/super-admin-auth/dto/super-admin-jwt-payload.dto.ts
export class SuperAdminJwtPayloadDto {
  sub: string; // SuperAdmin ID
  email: string;
  // Tambahkan field lain jika perlu, misal 'type: "superadmin"'
}

// Bisa juga tambahkan RefreshTokenPayload jika diperlukan
export class SuperAdminRefreshTokenPayloadDto extends SuperAdminJwtPayloadDto {
  refreshToken: string;
}
