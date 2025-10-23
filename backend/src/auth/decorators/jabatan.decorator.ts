// backend/src/auth/decorators/jabatan.decorator.ts
import { SetMetadata } from '@nestjs/common';

export type JabatanType = string; // Tambahkan string agar bisa custom

export const JABATAN_KEY = 'jabatan'; // Kunci untuk mengambil metadata

/**
 * Decorator untuk menetapkan jabatan yang diperlukan untuk mengakses endpoint.
 * @param jabatan Nama jabatan yang dibutuhkan (e.g., 'Bendahara', 'Ketua')
 */
export const Jabatan = (jabatan: JabatanType) =>
  SetMetadata(JABATAN_KEY, jabatan);
