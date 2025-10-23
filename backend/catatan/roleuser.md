Tentu, mari kita bedah konsep *user* dan *role* berdasarkan arsitektur *multi-tenant* yang Anda rancang, dengan mengacu pada dokumen PDF, `schema.prisma`, dan kode *guard* yang telah Anda buat.

Analisis Anda sudah sangat tepat. Konsep *role* di sistem ini harus dibagi menjadi dua level yang berbeda: **Level Platform (Super Admin)** dan **Level Tenant (Internal Koperasi)**.

-----

### 1\. Peran Level Platform (Akses Skema `public`)

Peran ini tidak memiliki subdomain dan berinteraksi langsung dengan data manajemen platform.

#### **`Super Admin`**

  * [cite\_start]**Siapa:** Pengelola platform `sistemkoperasi.id`[cite: 9].
  * **Tugas:** Mengelola pendaftaran koperasi baru (tenant). [cite\_start]Mereka melihat data di tabel `Tenant` [cite: 114] [cite\_start]dan `TenantRegistration` [cite: 119] untuk menyetujui atau menolak koperasi baru.
  * **Batasan (Penting):** Seperti yang Anda katakan, Super Admin **tidak boleh** bisa mengakses data *di dalam* tenant (misal: data anggota Koperasi A, simpanan Koperasi B).
  * **Implementasi Anda (Sudah Benar):**
      * `src/tenancy/tenancy.middleware.ts`: Saat Super Admin mengakses domain utama (tanpa subdomain), `req.tenantId` akan bernilai `undefined`.
      * `src/admin/super-admin/super-admin.guard.ts`: *Guard* ini secara eksplisit **mengizinkan** akses *hanya jika* `req.tenantId` adalah `undefined`. Jika ada `tenantId` (berarti sedang mengakses subdomain), *guard* ini akan melempar *ForbiddenException*.
      * `src/tenants/tenants.controller.ts`: *Controller* ini dilindungi oleh `SuperAdminGuard`, sehingga hanya bisa diakses oleh Super Admin untuk melakukan `approve` tenant.

-----

### 2\. Peran Level Tenant (Akses Skema `tenant_xyz`)

[cite\_start]Peran ini ada *di dalam* setiap skema tenant yang terisolasi [cite: 15] dan hanya bisa diakses melalui subdomain koperasi (misal: `koperasi-a.sistemkoperasi.id`).

Saat pendaftaran tenant disetujui, `tenants.service.ts` akan membuat skema baru dan memasukkan *user* pertama (PIC pendaftar) ke dalam tabel `users` di skema tersebut dengan peran "Pengurus".

[cite\_start]Berdasarkan PDF Anda [cite: 35, 36] [cite\_start]dan `schema.prisma`[cite: 116], ada dua peran utama di level ini:

#### **`Pengurus` (Pengelola Koperasi)**

  * [cite\_start]**Siapa:** Pengguna yang mengelola operasional koperasi (Ketua, Sekretaris, Bendahara)[cite: 18, 19, 20].
  * **Tugas:**
    1.  [cite\_start]Melakukan **CRUD** (Create, Read, Update, Delete) pada sebagian besar modul Buku 16 (Daftar Anggota, Inventaris, Notulen Rapat, dll)[cite: 35, 36].
    2.  [cite\_start]Menyetujui atau menolak "Calon Anggota" yang mendaftar melalui form publik[cite: 30].
  * [cite\_start]**Tabel Terkait:** Didefinisikan di tabel `Role` [cite: 116] [cite\_start]dan datanya disimpan di tabel `User` [cite: 115] di dalam skema tenant.

#### **`Anggota` (Anggota Koperasi)**

  * [cite\_start]**Siapa:** Anggota koperasi yang sudah disetujui[cite: 25, 32].
  * **Tugas:**
    1.  [cite\_start]Mengakses sistem setelah login[cite: 28].
    2.  [cite\_start]Melihat data **"Read-only (self)"** (hanya data milik sendiri) seperti Simpanan dan Pinjaman[cite: 36].
    3.  [cite\_start]Melihat data "Read-only" umum (seperti daftar pengurus, notulen rapat anggota)[cite: 35, 36].
    4.  [cite\_start]Membuat data baru di modul tertentu (misal: Buku Tamu, Saran Anggota)[cite: 36].
  * **Implementasi (Konsep Kunci):**
      * [cite\_start]Saat "Calon Anggota" [cite: 24] [cite\_start]mendaftar [cite: 27] [cite\_start]dan disetujui oleh `Pengurus`[cite: 30], sistem harus membuat **dua** *record* di dalam skema tenant tersebut:
        1.  [cite\_start]Satu *record* di tabel `User` [cite: 115] (untuk menyimpan email, *password*, dan `roleId` "Anggota").
        2.  [cite\_start]Satu *record* di tabel `Member` [cite: 125] [cite\_start](untuk menyimpan data pribadi "Buku 01" seperti nama, alamat, tanggal lahir, dll [cite: 158]).
      * [cite\_start]`User.id` [cite: 115] [cite\_start]dan `Member.id` [cite: 125] bisa jadi sama (menggunakan UUID yang sama) untuk memudahkan relasi, atau `User` bisa memiliki relasi `one-to-one` ke `Member`.

-----

### 3\. Akses Publik (Bukan *Role* tapi *Status*)

Ini adalah pengguna yang mengakses subdomain koperasi tetapi tidak *login*.

  * [cite\_start]**`Tamu` (Guest):** Siapapun yang membuka subdomain[cite: 21]. [cite\_start]Mereka hanya melihat "Landing Page Publik" [cite: 26] [cite\_start]dan modul yang ditandai "Read-only\*" (seperti Inventaris, Berita, dll)[cite: 36, 38].
  * [cite\_start]**`Calon Anggota` (Prospective Member):** Seorang `Tamu` yang membuka "Form Pendaftaran Anggota"[cite: 27]. Mereka memiliki akses *create* ke satu *endpoint* spesifik (API pendaftaran anggota).

-----

### Rekomendasi Konsep dan Implementasi Lanjutan

File `src/auth/enums/role.enum.ts` Anda saat ini hanya berisi `Pengurus` dan `Anggota`.

[cite\_start]Namun, PDF Anda [cite: 36] [cite\_start]dan file `BUKU 16 Modul.txt` [cite: 158, 159, 160, 161, 162] menyiratkan bahwa "Pengurus" bukanlah satu peran tunggal. Contoh:

  * [cite\_start]**Modul 04. Simpanan Anggota:** Hanya "Bendahara (CRUD)"[cite: 36].
  * [cite\_start]**Modul 06. Daftar Inventaris:** Hanya "Sekretaris (CRUD)"[cite: 36].
  * [cite\_start]**Modul 08. Notulen Rapat Pengurus:** "Sekretaris, Ketua (CRUD)"[cite: 36].

**Saran Implementasi:**

1.  [cite\_start]**Perkaya `Role` Enum:** Ubah `src/auth/enums/role.enum.ts` Anda untuk mencerminkan peran yang lebih spesifik, atau tambahkan *field* "jabatan" di model `User` yang terhubung ke `BoardPosition`[cite: 126]. Cara termudah adalah dengan *enum*:

    ```typescript
    // src/auth/enums/role.enum.ts
    export enum Role {
      // Pengurus Roles
      Ketua = 'Ketua',
      Sekretaris = 'Sekretaris',
      Bendahara = 'Bendahara',
      // Role Pengurus generik jika diperlukan
      Pengurus = 'Pengurus', 
      
      // Member Role
      Anggota = 'Anggota',
    }
    ```

    [cite\_start]*(Catatan: Anda mungkin perlu memikirkan bagaimana satu user (misal Ketua) bisa memiliki hak Bendahara jika orangnya sama. Mungkin lebih baik tetap `Role.Pengurus` tapi dikombinasikan dengan cek jabatan dari tabel `BoardPosition` [cite: 126]).*

2.  **Gunakan `RolesGuard` Secara Spesifik:** *Guard* Anda (`src/auth/guards/roles.guard.ts`) sudah siap untuk ini.

      * [cite\_start]**Contoh:** Untuk `src/simpanan/simpanan.controller.ts`, alih-alih `@Roles(Role.Pengurus)`, Anda harus menggunakannya sesuai PDF[cite: 36]:
        ```typescript
        // src/simpanan/simpanan.controller.ts
        // ...
        @Post('transaksi')
        @Roles(Role.Bendahara) // <-- Lebih spesifik
        @ApiOperation({
          summary: 'Mencatat transaksi simpanan baru (Setoran/Penarikan)',
        })
        createTransaksi(...) { /* ... */ }
        ```

# step 2
Kamu berada di kebingungan yang sangat wajar. Ini adalah keputusan desain arsitektur yang penting.

Berdasarkan dokumen PDF dan `schema.prisma` Anda, saya **sangat merekomendasikan** opsi kedua:

**Biarkan `Role` Enum Anda tetap sederhana (`Pengurus` dan `Anggota`), dan gunakan tabel `BoardPosition` sebagai penentu jabatan (Ketua, Sekretaris, Bendahara).**

Ini adalah pendekatan yang jauh lebih bersih dan lebih mudah dikelola.

-----

### Mengapa Pendekatan Ini Lebih Baik

1.  **Sumber Kebenaran Tunggal (Single Source of Truth):**

      * Model `BoardPosition` Anda sudah dirancang untuk menyimpan *jabatan* (`Ketua`, `Sekretaris`, dll.) dan riwayatnya (tanggal diangkat, tanggal berhenti).
      * Jika Anda juga menyimpan "Ketua" sebagai `Role` di tabel `User`, Anda akan menduplikasi data. Apa yang terjadi jika seorang `User` memiliki `Role` "Ketua" tetapi data di `BoardPosition`-nya adalah "Sekretaris"? Ini akan menyebabkan kekacauan data.

2.  **Fleksibilitas:**

      * Seseorang bisa berganti jabatan. Mereka mungkin menjadi "Sekretaris" selama 2 tahun, lalu terpilih menjadi "Ketua".
      * Model `BoardPosition` Anda sudah menangani ini dengan sempurna. Anda hanya perlu mengisi `tanggalBerhenti` di jabatan lama dan membuat *record* baru untuk jabatan baru.
      * Jika `Role` di tabel `User` di-*hardcode* sebagai "Sekretaris", Anda harus repot mengubah tabel `User` setiap kali ada pergantian jabatan.

3.  **Akurasi Konsep:**

      * **`Role` (Peran):** Sebaiknya merepresentasikan *level akses* umum Anda di sistem. Contoh: `Pengurus` (bisa mengelola) dan `Anggota` (bisa melihat).
      * **`Jabatan` (Posisi):** Merepresentasikan *pekerjaan spesifik* Anda. Contoh: `Ketua`, `Bendahara`.

`Role` Anda (`Pengurus`) memberi Anda "kunci" untuk masuk ke "ruang staf". `Jabatan` Anda (`Bendahara`) memberi Anda "kunci" spesifik untuk membuka "brankas" (modul simpanan).

-----

### Bagaimana Cara Implementasinya?

Anda sudah 90% selesai. Anda hanya perlu menambahkan satu "lapisan" pemeriksaan lagi.

1.  **Biarkan `src/auth/enums/role.enum.ts` Apa Adanya:**

    ```typescript
    export enum Role {
      Pengurus = 'Pengurus',
      Anggota = 'Anggota',
    }
    ```

2.  **Gunakan `RolesGuard` untuk Akses Umum:**

      * Untuk *endpoint* yang bisa diakses *semua* pengurus (misal: melihat daftar karyawan), `RolesGuard` Anda sudah sempurna:
        ```typescript
        @Get()
        @Roles(Role.Pengurus) // <-- Sempurna
        findAll() { /* ... */ }
        ```

3.  **Buat `JabatanGuard` BARU untuk Akses Spesifik:**
    Untuk *endpoint* yang spesifik (seperti Bendahara di modul Simpanan.pdf]), Anda perlu *guard* baru yang memeriksa tabel `BoardPosition`.

    **Contoh Logika `JabatanGuard`:**

      * *Guard* ini akan mengambil `user` dari JWT (sama seperti `RolesGuard`).
      * *Guard* ini juga akan mengambil *jabatan* yang diperlukan (misal: "Bendahara") dari *decorator* baru (misal: `@Jabatan('Bendahara')`).
      * Ia akan melakukan *query* ke database: "Apakah `user.userId` ini memiliki *record* di `BoardPosition` dengan `jabatan` = 'Bendahara' DAN `tanggalBerhenti` = `null`?"
      * Jika ya, izinkan.
      * Jika tidak, tolak.

**Contoh Penggunaan di Controller Simpanan:**

Beginilah nanti tampilan `simpanan.controller.ts` Anda:

```typescript
// src/simpanan/simpanan.controller.ts
import { JabatanGuard } from 'src/auth/guards/jabatan.guard'; // <-- Guard baru
import { Jabatan } from 'src/auth/decorators/jabatan.decorator'; // <-- Decorator baru

@ApiTags('Simpanan Anggota (Buku 04)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, JabatanGuard) // <-- Tambahkan Guard baru di sini
@Controller('simpanan')
export class SimpananController {
  // ...

  @Post('transaksi')
  @Roles(Role.Pengurus)   // 1. Periksa: Apakah dia Pengurus?
  @Jabatan('Bendahara')  // 2. Periksa: Apakah dia Bendahara AKTIF?
  @ApiOperation({
    summary: 'Mencatat transaksi simpanan baru (Setoran/Penarikan)',
  })
  createTransaksi(
    @Body() createDto: CreateSimpananTransaksiDto,
    @GetUser() user: JwtPayloadDto,
  ) {
    return this.simpananService.createTransaksi(createDto, user);
  }

  // ...
}
```

**Kesimpulan:** Jangan membuat `Role` Anda menjadi rumit. Biarkan `Role` sederhana (`Pengurus`/`Anggota`) dan biarkan `BoardPosition` menjadi penentu *jabatan*. Ini adalah desain yang paling kuat dan sesuai dengan skema database yang sudah Anda buat.