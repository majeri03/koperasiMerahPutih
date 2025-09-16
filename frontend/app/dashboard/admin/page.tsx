// Lokasi: frontend/app/dashboard/admin/page.tsx
"use client";

import { Users, PiggyBank, HandCoins, UserPlus, PlusCircle, Megaphone, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- Tipe Data (Nanti sesuaikan dengan API) ---
type DashboardData = {
  namaKoperasi: string;
  stats: {
    totalAnggota: { value: number; change: number };
    totalSimpanan: { value: number; change: number };
    totalPinjaman: { value: number; change: number };
  };
  pendaftarBaru: number;
  anggotaTerbaru: { nama: string; tanggalMasuk: string }[];
  // Tambahkan data untuk grafik di sini
};

// --- Komponen Kartu Statistik ---
const StatCard = ({ icon, title, value, change, color, unit = '' }: any) => {
  const IconComponent = icon;
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-transform hover:scale-105">
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
        <span className={`flex items-center font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <ArrowUpRight size={16} className={!isPositive ? 'transform rotate-180' : ''} />
          {Math.abs(change)}%
        </span>
        <span className="text-gray-500">vs bulan lalu</span>
      </div>
    </div>
  );
};

// --- Komponen Placeholder untuk Grafik ---
// Anda perlu install library grafik seperti Recharts atau Chart.js
// Contoh: npm install recharts
const ChartPlaceholder = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-80 flex flex-col">
    <h3 className="font-bold text-gray-700">{title}</h3>
    <div className="flex-1 flex items-center justify-center text-gray-400">
      [ Placeholder untuk Grafik {title} ]
    </div>
  </div>
);


export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      const mockData: DashboardData = {
        namaKoperasi: "Koperasi Merah Putih",
        stats: {
          totalAnggota: { value: 152, change: 5 },
          totalSimpanan: { value: 850750000, change: 12 },
          totalPinjaman: { value: 215500000, change: -3 },
        },
        pendaftarBaru: 3,
        anggotaTerbaru: [
          { nama: "Siti Lestari", tanggalMasuk: "14 Sep 2025" },
          { nama: "Agus Purnomo", tanggalMasuk: "11 Sep 2025" },
          { nama: "Rina Wulandari", tanggalMasuk: "08 Sep 2025" },
        ],
      };
      setData(mockData);
      setLoading(false);
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !data) {
    return <div className="text-center p-10">Memuat dashboard modern Anda... ✨</div>;
  }

  return (
    <div className="space-y-8">
      {/* --- BAGIAN HEADER --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard {data.namaKoperasi}</h1>
        <p className="mt-2 text-gray-600">Selamat datang kembali! Berikut ringkasan operasional koperasi Anda.</p>
      </div>

      {/* --- TOMBOL AKSI CEPAT --- */}
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/admin/persetujuan-anggota" className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow hover:bg-yellow-600 transition">
          <UserPlus size={18} /><span>{data.pendaftarBaru} Pendaftar Baru</span>
        </Link>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition">
          <PlusCircle size={18} /><span>Catat Transaksi</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition">
          <Megaphone size={18} /><span>Buat Pengumuman</span>
        </button>
      </div>

      {/* --- KARTU STATISTIK MODERN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} title="Total Anggota" value={data.stats.totalAnggota.value} change={data.stats.totalAnggota.change} color="blue" />
        <StatCard icon={PiggyBank} title="Total Simpanan" value={data.stats.totalSimpanan.value} change={data.stats.totalSimpanan.change} color="green" unit="Rp " />
        <StatCard icon={HandCoins} title="Pinjaman Beredar" value={data.stats.totalPinjaman.value} change={data.stats.totalPinjaman.change} color="red" unit="Rp " />
      </div>

      {/* --- GRAFIK VISUAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title="Pertumbuhan Anggota (6 Bulan Terakhir)" />
        <ChartPlaceholder title="Simpanan vs Pinjaman" />
      </div>

      {/* --- ANGGOTA TERBARU --- */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="font-bold text-gray-700">Anggota Bergabung Baru-baru Ini</h3>
        <div className="mt-4 flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {data.anggotaTerbaru.map((anggota, index) => (
              <li key={index} className="py-4 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                    {anggota.nama.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{anggota.nama}</p>
                  <p className="text-sm text-gray-500 truncate">Bergabung pada {anggota.tanggalMasuk}</p>
                </div>
                <div>
                  <Link href="#" className="inline-flex items-center shadow-sm px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                    Lihat
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}