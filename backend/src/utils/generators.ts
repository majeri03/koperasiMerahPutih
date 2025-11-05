// src/utils/generators.ts

/**
 * Menghasilkan Nomor Anggota unik 11 digit.
 * Dibuat dari 9 digit timestamp terakhir + 2 digit angka acak
 * untuk menghindari tabrakan (collision) jika ada >1 registrasi
 * dalam satu milidetik yang sama.
 * @returns {string} Nomor Anggota 11 digit
 */
export function generateUniqueMemberNumber(): string {
  const timestampPart = Date.now().toString().slice(-9); // 9 digit terakhir
  const randomPart = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0'); // 2 digit acak

  return `${timestampPart}${randomPart}`;
}
