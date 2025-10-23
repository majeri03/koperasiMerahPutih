1. forget password all akun
2. migrasi tenant kalau mau update schema di tenant sub domain agar dibuatkan api khusus
3. relasi akun user dan role pengawas gitu dan user lainnyya serta endpoint post modul  auditkan

# Progress dan masalah saat ini
Tentu, ini adalah poin-poin yang sangat penting. Pertanyaan Anda menunjukkan pemahaman yang mendalam tentang arsitektur sistem ini.

Mari saya rangkum poin-poin kritis tersebut sebagai catatan untuk Anda, lalu saya akan menjawab pertanyaan spesifik Anda.

---

### Catatan Kritis: Alur Logika `Member`, `User`, dan `Role` (Jabatan)

Berikut adalah rangkuman dari celah logika yang kita diskusikan dan bagaimana alur yang seharusnya:

1.  **Konsep Dasar: `Member` vs `User`**
    * **`Member` (Tabel `members`):** Ini adalah data "kependudukan" koperasi (Buku 01). Ini adalah identitas fisik seseorang sebagai anggota.
    * **`User` (Tabel `users`):** Ini adalah data "akun login" ke sistem. Ini adalah identitas digital yang memiliki email, *password*, dan *Role* (Peran) untuk otorisasi.
    * **Aturan:** Setiap `User` (selain Super Admin) *harus* terhubung ke satu `Member`. Tapi, tidak semua `Member` (terutama yang didaftarkan manual) otomatis memiliki `User`.

2.  **Celah Logika: Pendaftaran Manual vs Otomatis**
    * **Alur Otomatis (`POST /member-registrations`):** Alur ini **SUDAH BENAR**. Saat Pengurus menyetujui pendaftaran, service Anda secara otomatis membuat data `Member` *dan* data `User` (dengan Role `Anggota`). Hasilnya: Anggota baru yang bisa langsung login.
    * **Alur Manual (`POST /members`):** Alur ini **MENCIPTAKAN MASALAH**. Endpoint ini hanya membuat data `Member` (Buku 01). Hasilnya: Anggota baru terdaftar di koperasi, tetapi dia **tidak punya akun** dan **tidak bisa login**.

3.  **Solusi yang Hilang (Perlu Dibuat):**
    * **Endpoint "Buat Akun Manual":** Anda perlu endpoint baru (misal: `POST /users/create-account-for-member`) yang HANYA bisa diakses Pengurus. Inputnya adalah `memberId` (dari anggota yang didaftar manual), `email`, dan `password`. Tugasnya adalah membuat `User` baru dan menautkannya ke `Member` yang sudah ada.
    * **Role `Pengawas` (Supervisor):** Role ini hilang. Anda harus menambahkannya di `src/auth/enums/role.enum.ts` dan di file `src/tenants/tenants.service.ts` (di dalam Raw SQL `INSERT INTO "${schemaName}".roles`).
    * **Logika "Promosi Jabatan":** Service `board-positions.service.ts` dan `supervisory-positions.service.ts` harus diperbarui. Saat `create` (memberi jabatan baru), mereka tidak hanya membuat data di tabel jabatan, tetapi juga harus **MENG-UPDATE** tabel `users` untuk `memberId` tersebut, mengubah `roleId` mereka menjadi Role `Pengurus` atau Role `Pengawas`.

---