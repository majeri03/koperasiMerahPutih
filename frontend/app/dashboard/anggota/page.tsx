// Lokasi: frontend/app/dashboard/anggota/page.tsx
"use client";

import Link from "next/link";
import { Banknote, HandCoins, User, Newspaper, Activity, ArrowRight, MessageSquare, FileText, LayoutGrid } from "lucide-react";
import Button from "@/components/Button";
import { useEffect, useState } from "react";

// Tipe data yang lebih lengkap untuk dasbor baru
type DashboardData = {
  namaAnggota: string;
  simpanan: { total: number; pokok: number; wajib: number; sukarela: number; };
  pinjaman: { aktif: number; sisaAngsuran: number; totalAngsuran: number; };
};
type Transaksi = { jenis: 'Setoran' | 'Penarikan' | 'Angsuran'; tanggal: string; jumlah: number; keterangan: string; };
type Pengumuman = { judul: string; ringkasan: string; href: string; };

export default function AnggotaDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Data Contoh (Mock Data) ---
  const mockTransaksi: Transaksi[] = [
    { jenis: 'Setoran', tanggal: '15 Sep 2025', jumlah: 100000, keterangan: 'Simpanan Wajib' },
    { jenis: 'Angsuran', tanggal: '10 Sep 2025', jumlah: -500000, keterangan: 'Angsuran Pinjaman' },
    { jenis: 'Setoran', tanggal: '01 Sep 2025', jumlah: 250000, keterangan: 'Simpanan Sukarela' },
  ];
  const mockPengumuman: Pengumuman[] = [
    { judul: "Jadwal Libur Pelayanan Idul Adha", ringkasan: "Pelayanan koperasi akan libur pada...", href: "#" },
    { judul: "Program Pinjaman Modal Usaha Baru", ringkasan: "Ajukan pinjaman modal usaha dengan bunga...", href: "#" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      const mockResult: DashboardData = {
        namaAnggota: "Alviansyah Burhani",
        simpanan: { total: 5750000, pokok: 500000, wajib: 4250000, sukarela: 1000000 },
        pinjaman: { aktif: 1200000, sisaAngsuran: 8, totalAngsuran: 12 },
      };
      setData(mockResult);
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return <div className="text-center p-10">Memuat data dashboard...</div>;
  }

  const pinjamanLunas = data.pinjaman.totalAngsuran - data.pinjaman.sisaAngsuran;
  const pinjamanProgress = (pinjamanLunas / data.pinjaman.totalAngsuran) * 100;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {data.namaAnggota}!</h1>
      <p className="mt-2 text-gray-600">Berikut adalah ringkasan akun koperasi Anda.</p>

      {/* --- Layout Baru Dasbor --- */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (2/3 Lebar) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kartu Ringkasan Atas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KARTU SIMPANAN */}
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full"><HandCoins className="h-6 w-6 text-green-600" /></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Simpanan</h3>
                  <p className="text-2xl font-bold text-gray-800">Rp {data.simpanan.total.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="mt-4 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400">
                [Grafik Pertumbuhan Saldo 6 Bulan Terakhir]
              </div>
              <div className="mt-4 flex gap-3">
                <Button className="w-full">Setor Sukarela</Button>
                <Link href="/dashboard/anggota/simpanan" className="w-full">
                  <Button variant="outline" className="w-full">Lihat Detail</Button>
                </Link>
              </div>
            </div>

            {/* KARTU PINJAMAN */}
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full"><Banknote className="h-6 w-6 text-red-600" /></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sisa Pinjaman Aktif</h3>
                  <p className="text-2xl font-bold text-gray-800">Rp {data.pinjaman.aktif.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600">Progres Lunas</span>
                  <span className="font-semibold">{pinjamanLunas} / {data.pinjaman.totalAngsuran} Angsuran</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${pinjamanProgress}%` }}></div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button className="w-full">Bayar Angsuran</Button>
                 <Link href="/dashboard/anggota/pinjaman" className="w-full">
                  <Button variant="outline" className="w-full">Lihat Detail</Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* WIDGET AKTIVITAS TERAKHIR */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-brand-red-600"/>
              <h3 className="text-lg font-bold text-gray-800">Aktivitas Terakhir</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {mockTransaksi.map((trx, index) => (
                <li key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-700">{trx.keterangan}</p>
                    <p className="text-xs text-gray-500">{trx.tanggal}</p>
                  </div>
                  <p className={`font-bold ${trx.jumlah > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trx.jumlah > 0 ? '+' : ''} Rp {Math.abs(trx.jumlah).toLocaleString('id-ID')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* KOLOM KANAN (1/3 Lebar) */}
        <div className="space-y-6">
          {/* KARTU PROFIL */}
          <div className="bg-white p-6 rounded-xl shadow-lg border text-center">
            <User className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-bold text-gray-800">{data.namaAnggota}</h3>
            <p className="text-sm text-gray-500">Anggota Aktif</p>
            <Link href="/dashboard/anggota/profile" className="w-full">
              <Button variant="outline" className="w-full mt-4">Lihat Profil Lengkap</Button>
            </Link>
          </div>

          {/* KARTU MENU CEPAT */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-6 w-6 text-brand-red-600"/>
              <h3 className="text-lg font-bold text-gray-800">Menu Cepat</h3>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/dashboard/anggota/saran" className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-500"/>
                  <span className="font-semibold text-gray-700">Kirim Saran</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link href="/dashboard/anggota/notulen" className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500"/>
                  <span className="font-semibold text-gray-700">Lihat Arsip Notulen</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform"/>
              </Link>
            </div>
          </div>
          
          {/* WIDGET PENGUMUMAN */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center gap-3">
              <Newspaper className="h-6 w-6 text-brand-red-600"/>
              <h3 className="text-lg font-bold text-gray-800">Pengumuman</h3>
            </div>
            <ul className="mt-4 space-y-4">
              {mockPengumuman.map((item, index) => (
                <li key={index} className="border-b pb-2 last:border-b-0">
                  <a href={item.href} className="group">
                    <p className="font-semibold text-gray-700 group-hover:text-brand-red-600">{item.judul}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.ringkasan}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}