# ================= SIKLUS KERJA GIT LENGKAP =================
# Ganti semua yang ada di dalam kurung <...>

# --- PILIH SALAH SATU DARI DUA OPSI DI BAWAH INI ---

# --- OPSI 1: Jika Mau Mengerjakan TUGAS BARU ---
git checkout main
git pull origin main
git checkout -b <backend/nama-fitur-BARU>

# --- OPSI 2: Jika Mau MELANJUTKAN Tugas di Branch Lama ---
# (Pastikan branch `main` juga terupdate agar tidak ada konflik nanti)
git checkout main
git pull origin main
# (Pindah ke branch kerjamu yang sudah ada)
git checkout <backend/nama-fitur-LAMA>
# (Ambil update terbaru dari `main` ke branch kerjamu)
git merge main


# --- BAGIAN TERAKHIR: Simpan & Upload Progress (Sama untuk OPSI 1 & 2) ---
# (Jalankan ini setelah selesai coding di hari itu)
git add .
git commit -m "<Tulis pesan progress hari ini>"
git push origin <nama-branch-yang-sedang-dikerjakan>

# ===============================================================
