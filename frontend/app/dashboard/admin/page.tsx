// Lokasi: frontend/app/dashboard/admin/page.tsx
"use client";

import { 
    Users, PiggyBank, HandCoins, UserPlus, ArrowUpRight, 
    MessageSquare, Send, Landmark, BookUser
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, ElementType } from "react";
import { simpananApi, loanApi, type SimpananTransaksi as SimpananTrx, type Loan } from "@/lib/apiService";
import clsx from "clsx";

// --- Tipe Data Diperbarui ---
type DashboardData = {
  namaKoperasi: string;
  stats: {
    totalAnggota: { value: number; change: number };
    totalSimpanan: { value: number; change: number };
    totalPinjaman: { value: number; change: number };
  };
  tugas: {
      pendaftarBaru: number;
      saranBaru: number;
  };
  anggotaTerbaru: { nama: string; tanggalMasuk: string }[];
  // PERBAIKAN: Mengganti 'any' dengan 'ElementType'
  aktivitasTerbaru: { ikon: ElementType; teks: string; waktu: string; }[];
};

// --- PERBAIKAN: Definisikan tipe props untuk StatCard ---
type StatCardProps = {
  icon: ElementType;
  title: string;
  value: number;
  change: number;
  color: string;
  unit?: string;
  neutralThreshold?: number; // persen yang dianggap netral
};

// --- Komponen Kartu Statistik ---
// PERBAIKAN: Terapkan tipe StatCardProps
const StatCard = ({ icon, title, value, change, color, unit = '', neutralThreshold = 1 }: StatCardProps) => {
  const IconComponent = icon;
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < neutralThreshold;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <IconComponent className={`h-7 w-7 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{unit}{value.toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-sm">
        <span className={`flex items-center font-semibold ${isNeutral ? 'text-gray-500' : (isPositive ? 'text-green-600' : 'text-red-600')}`}>
          <ArrowUpRight size={16} className={isNeutral ? 'opacity-60' : (!isPositive ? 'transform rotate-180' : '')} />
          {Math.abs(change)}%
        </span>
        <span className="text-gray-500">vs bulan lalu</span>
      </div>
    </div>
  );
};

// --- PERBAIKAN: Definisikan tipe props untuk ActionCard ---
type ActionCardProps = {
  href: string;
  icon: ElementType;
  title: string;
  description: string;
  color: string;
};

// --- Komponen Kartu Aksi Cepat ---
// PERBAIKAN: Terapkan tipe ActionCardProps
const ActionCard = ({ href, icon, title, description, color }: ActionCardProps) => {
    const Icon = icon;
    return (
        <Link href={href} className={`p-5 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all flex items-center gap-4`}>
            <div className={`p-3 rounded-full bg-${color}-100`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div>
                <h3 className="font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </Link>
    )
}


export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calcPct = (now: number, prev: number) => {
      if (!prev || prev <= 0) return 0;
      return Math.round(((now - prev) / prev) * 1000) / 10; // 1 decimal
    };

    const endOfPrevMonth = (d: Date) => {
      const dt = new Date(d.getFullYear(), d.getMonth(), 0); // last day of previous month
      dt.setHours(23, 59, 59, 999);
      return dt;
    };

    const fetchDashboard = async () => {
      try {
        const now = new Date();

        // ------- Simpanan -------
        const [saldo, trx] = await Promise.all([
          simpananApi.getTotalSaldo().catch(() => ({ saldoPokok: 0, saldoWajib: 0, saldoSukarela: 0 })),
          simpananApi.getAllTransactions().catch(() => [] as SimpananTrx[]),
        ]);
        // Helper untuk menghitung saldo pada tanggal tertentu dari transaksi
        const balanceAt = (date: Date) => (trx as SimpananTrx[]).reduce((acc, t) => {
          const tgl = new Date(t.tanggal);
          if (tgl <= date) {
            const tipe = (t.tipe || '').toString().toUpperCase();
            const sign = tipe === 'SETORAN' || tipe === 'SETORAN ' ? 1 : tipe === 'PENARIKAN' ? -1 : 0;
            return acc + sign * (t.jumlah || 0);
          }
          return acc;
        }, 0);

        // Hitung saldo current dan akhir bulan lalu dari transaksi; gunakan saldo API sebagai preferensi untuk NOW jika tersedia
        const totalSimpananNowByTrx = balanceAt(now);
        let totalSimpananNow = (saldo.saldoPokok || 0) + (saldo.saldoWajib || 0) + (saldo.saldoSukarela || 0);
        if (totalSimpananNow === 0) totalSimpananNow = totalSimpananNowByTrx;
        const endPrevMonth = endOfPrevMonth(now);
        const totalSimpananPrevByTrx = balanceAt(endPrevMonth);
        // Delta bulan berjalan (net setoran-penarikan pada bulan ini)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthDelta = (trx as SimpananTrx[]).reduce((acc, t) => {
          const tgl = new Date(t.tanggal);
          if (tgl >= monthStart && tgl <= now) {
            const tipe = (t.tipe || '').toString().toUpperCase();
            const sign = tipe === 'SETORAN' || tipe === 'SETORAN ' ? 1 : tipe === 'PENARIKAN' ? -1 : 0;
            return acc + sign * (t.jumlah || 0);
          }
          return acc;
        }, 0);
        const totalSimpananPrevByDelta = totalSimpananNow - monthDelta;
        // Pilih prev berdasarkan ketersediaan histori transaksi.
        // Jika histori sebelum bulan ini tidak lengkap (mis. import saldo awal), prevByTrx bisa 0.
        // Dalam kasus itu gunakan prevByDelta sebagai fallback.
        const totalSimpananPrev = totalSimpananPrevByTrx > 0 ? totalSimpananPrevByTrx : Math.max(0, totalSimpananPrevByDelta);
        const pctSimpanan = calcPct(totalSimpananNow, totalSimpananPrev);

        // ------- Pinjaman Beredar -------
        const loans: Loan[] = await loanApi.getAllLoans().catch(() => [] as Loan[]);
        // Gunakan hanya tanggal untuk menentukan status aktif pada titik waktu tertentu.
        // Jangan bergantung pada field status saat ini, karena loan yang sudah lunas bulan ini
        // mungkin tetap aktif pada akhir bulan lalu.
        const activeAt = (loan: Loan, date: Date) => {
          const start = new Date(loan.loanDate);
          const end = loan.paidOffDate ? new Date(loan.paidOffDate) : null;
          return start <= date && (!end || end > date);
        };
        const endPrev = endOfPrevMonth(now);
        const pinjamanNow = loans.reduce((sum, l) => (activeAt(l, now) ? sum + (l.loanAmount || 0) : sum), 0);
        const pinjamanPrev = loans.reduce((sum, l) => (activeAt(l, endPrev) ? sum + (l.loanAmount || 0) : sum), 0);
        const pctPinjaman = calcPct(pinjamanNow, pinjamanPrev);

        const ds: DashboardData = {
          namaKoperasi: "Koperasi Merah Putih",
          stats: {
            totalAnggota: { value: 152, change: 5 }, // tetap mock untuk sekarang
            totalSimpanan: { value: totalSimpananNow, change: pctSimpanan },
            totalPinjaman: { value: pinjamanNow, change: pctPinjaman },
          },
          tugas: { pendaftarBaru: 3, saranBaru: 5 },
          anggotaTerbaru: [
            { nama: "Siti Lestari", tanggalMasuk: "14 Sep 2025" },
            { nama: "Agus Purnomo", tanggalMasuk: "11 Sep 2025" },
            { nama: "Rina Wulandari", tanggalMasuk: "08 Sep 2025" },
          ],
          aktivitasTerbaru: [
            { ikon: HandCoins, teks: "Pinjaman baru untuk Budi Santoso telah dicatat.", waktu: "2 jam lalu" },
            { ikon: Landmark, teks: "Setoran sukarela dari Alviansyah Burhani diterima.", waktu: "Kemarin" },
            { ikon: BookUser, teks: "Andi Wijaya diangkat sebagai Ketua Pengurus.", waktu: "3 hari lalu" },
          ],
        };
        setData(ds);
        setLoading(false);
      } catch (e) {
        console.error('Gagal memuat ringkasan dashboard:', e);
        // Jika gagal, tetap tampilkan mock supaya dashboard tidak kosong
        setData({
          namaKoperasi: "Koperasi Merah Putih",
          stats: {
            totalAnggota: { value: 152, change: 5 },
            totalSimpanan: { value: 0, change: 0 },
            totalPinjaman: { value: 0, change: 0 },
          },
          tugas: { pendaftarBaru: 0, saranBaru: 0 },
          anggotaTerbaru: [],
          aktivitasTerbaru: [],
        });
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const DashboardSkeleton = () => (
    <div>
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="h-5 w-1/2 mt-2" />

      {/* --- KARTU AKSI CEPAT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-4">
            <div className="p-3 rounded-full bg-gray-100">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* --- KARTU STATISTIK MODERN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
            <Skeleton className="mt-4 h-5 w-1/2" />
          </div>
        ))}
      </div>

      {/* --- LAYOUT DUA KOLOM --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* KOLOM KIRI (LEBIH BESAR) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TUGAS & NOTIFIKASI */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* AKTIVITAS TERBARU */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="mt-1 h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-64 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (LEBIH KECIL) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* --- BAGIAN HEADER --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard {data.namaKoperasi}</h1>
        <p className="mt-2 text-gray-600">Selamat datang kembali! Berikut ringkasan operasional koperasi Anda.</p>
      </div>

      {/* --- KARTU AKSI CEPAT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard href="/dashboard/admin/simpanan-anggota" icon={Landmark} title="Catat Simpanan" description="Input setoran & penarikan" color="green" />
        <ActionCard href="/dashboard/admin/pinjaman-anggota" icon={HandCoins} title="Catat Pinjaman" description="Buat pengajuan pinjaman baru" color="red" />
        <ActionCard href="/dashboard/admin/daftar-anggota" icon={UserPlus} title="Tambah Anggota" description="Daftarkan anggota baru" color="blue" />
        <ActionCard href="/dashboard/admin/pinjaman-anggota" icon={Send} title="Kirim Notifikasi" description="Info jatuh tempo pinjaman" color="purple" />
      </div>

      {/* --- KARTU STATISTIK MODERN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} title="Total Anggota" value={data.stats.totalAnggota.value} change={data.stats.totalAnggota.change} color="blue" />
        <StatCard icon={PiggyBank} title="Total Simpanan" value={data.stats.totalSimpanan.value} change={data.stats.totalSimpanan.change} color="green" unit="Rp " neutralThreshold={1} />
        <StatCard icon={HandCoins} title="Pinjaman Beredar" value={data.stats.totalPinjaman.value} change={data.stats.totalPinjaman.change} color="red" unit="Rp " neutralThreshold={1} />
      </div>

      {/* --- LAYOUT DUA KOLOM --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (LEBIH BESAR) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* TUGAS & NOTIFIKASI */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-700">Tugas & Notifikasi</h3>
                <div className="mt-4 space-y-3">
                    <Link href="/dashboard/admin/persetujuan-anggota" className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 transition">
                        <div className="flex items-center gap-3">
                            <UserPlus className="h-5 w-5 text-yellow-700"/>
                            <span className="font-semibold text-yellow-800">Persetujuan Anggota Baru</span>
                        </div>
                        <span className="font-bold text-white bg-yellow-500 rounded-full px-2 py-0.5 text-sm">{data.tugas.pendaftarBaru}</span>
                    </Link>
                     <Link href="/dashboard/admin/saran-anggota" className="flex justify-between items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-blue-700"/>
                            <span className="font-semibold text-blue-800">Saran Anggota Masuk</span>
                        </div>
                        <span className="font-bold text-white bg-blue-500 rounded-full px-2 py-0.5 text-sm">{data.tugas.saranBaru}</span>
                    </Link>
                </div>
            </div>

            {/* AKTIVITAS TERBARU */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-700">Aktivitas Terbaru</h3>
                <ul className="mt-4 space-y-4">
                    {data.aktivitasTerbaru.map((aktivitas, index) => {
                        const Icon = aktivitas.ikon;
                        return (
                            <li key={index} className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-full mt-1">
                                    <Icon className="h-5 w-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800">{aktivitas.teks}</p>
                                    <p className="text-xs text-gray-400">{aktivitas.waktu}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>

        {/* KOLOM KANAN (LEBIH KECIL) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-700">Anggota Bergabung Baru-baru Ini</h3>
            <div className="mt-4 flow-root">
                <ul role="list" className="-my-5 divide-y divide-gray-200">
                    {data.anggotaTerbaru.map((anggota, index) => (
                    <li key={index} className="py-3 flex items-center space-x-4">
                        <div className="shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                {anggota.nama.charAt(0)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{anggota.nama}</p>
                            <p className="text-sm text-gray-500 truncate">Bergabung {anggota.tanggalMasuk}</p>
                        </div>
                    </li>
                    ))}
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
}
