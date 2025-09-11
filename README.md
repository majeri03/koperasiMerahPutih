
---

#  Siklus Kerja Git 

## Ringkas

| Mode                            | Kapan dipakai                  | Langkah cepat                                                      |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------ |
| **Opsi 1 – Tugas Baru**         | Buat fitur/pekerjaan baru      | `checkout main` → `pull` → `checkout -b <nama-branch-baru>`        |
| **Opsi 2 – Lanjut Branch Lama** | Lanjutkan pekerjaan sebelumnya | `checkout main` → `pull` → `checkout <branch-lama>` → `merge main` |
| **Simpan & Upload**             | Setelah coding selesai         | `add` → `commit` → `push`                                          |

## Placeholder yang Harus Diganti

| Placeholder                            | Contoh                                              | Keterangan                            |
| -------------------------------------- | --------------------------------------------------- | ------------------------------------- |
| `<backend/nama-fitur-BARU>`            | `backend/feat-midtrans-settlement`                  | Nama branch baru (pakai kebab-case)   |
| `<backend/nama-fitur-LAMA>`            | `backend/feat-auth-register`                        | Nama branch lama yang mau dilanjutkan |
| `<nama-branch-yang-sedang-dikerjakan>` | `backend/feat-midtrans-settlement`                  | Branch aktif saat push                |
| `<Tulis pesan progress hari ini>`      | `feat: handle webhook settlement & aktivasi tenant` | Pesan commit singkat & jelas          |

---

## ✅ Opsi 1 — Tugas Baru

```bash
git checkout main
git pull origin main
git checkout -b <backend/nama-fitur-BARU>
```

## 🔁 Opsi 2 — Lanjutkan Tugas di Branch Lama

```bash
git checkout main
git pull origin main
git checkout <backend/nama-fitur-LAMA>
git merge main
```

## 📤 Simpan & Upload Progress (Semua Opsi)

```bash
git add .
git commit -m "<Tulis pesan progress hari ini>"
git push origin <nama-branch-yang-sedang-dikerjakan>
```

---

## Tips Cepat (Anti Konflik)

* Commit kecil & sering, pesan jelas.
* Kerjakan hanya foldermu: `git add backend/**` (atau `frontend/**`).
* Sebelum push: `git pull --rebase origin main` biar riwayat bersih.
* Pastikan `.gitignore` menutup `node_modules/`, `dist/`, `.env`, dll.

> Opsional (sekali set):
> `git config --global pull.rebase true`
> `git config --global rebase.autoStash true`

---
