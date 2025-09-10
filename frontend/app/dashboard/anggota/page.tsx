"use client";

import Link from "next/link";
import { Banknote, HandCoins, User, Landmark, Gem, CalendarClock, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

// Tipe data yang lebih detail
type DashboardData = {
  namaAnggota: string;
  nomorAnggota: string;
  tanggalBergabung: string;
  simpanan: {
    total: number;
    pokok: number;
    wajib: number;
    sukarela: number;
  };
  pinjaman: {
    aktif: number;
    jatuhTempo: string;
    sisaAngsuran: number;
    totalAngsuran: number;
  };
};

export default function AnggotaDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- TODO: Ganti bagian ini dengan pemanggilan API ---
    const fetchDashboardData = async () => {
      const mockResult: DashboardData = {
        namaAnggota: "Alviansyah Burhani",
        nomorAnggota: "AGT-00123",
        tanggalBergabung: "15 Jan 2024",
        simpanan: {
          total: 5750000,
          pokok: 500000,
          wajib: 4250000,
          sukarela: 1000000,
        },
        pinjaman: {
          aktif: 1200000,
          jatuhTempo: "25 Sep 2025",
          sisaAngsuran: 8,
          totalAngsuran: 12,
        },
      };
      setData(mockResult);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Memuat data dashboard...</div>;
  }
  
  if (!data) {
    return <div className="text-center p-10">Gagal memuat data.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {data.namaAnggota}!</h1>
      <p className="mt-2 text-gray-600">Berikut adalah ringkasan akun koperasi Anda.</p>

      {/* Grid untuk kartu-kartu ringkasan */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KARTU SIMPANAN */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <HandCoins className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Simpanan</h3>
                <p className="text-2xl font-bold text-gray-800">
                  Rp {data.simpanan.total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center gap-2"><Landmark size={16} /> Pokok</span><span className="font-medium">Rp {data.simpanan.pokok.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center gap-2"><CalendarClock size={16} /> Wajib</span><span className="font-medium">Rp {data.simpanan.wajib.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center gap-2"><Gem size={16} /> Sukarela</span><span className="font-medium">Rp {data.simpanan.sukarela.toLocaleString('id-ID')}</span></div>
            </div>
          </div>
          <Link href="/dashboard/anggota/simpanan" className="block border-t border-gray-100 bg-gray-50 hover:bg-gray-100 p-4 text-center text-sm font-medium text-brand-red-600 rounded-b-xl transition">
            Lihat Detail Simpanan
          </Link>
        </div>

        {/* KARTU PINJAMAN */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Banknote className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sisa Pinjaman Aktif</h3>
                <p className="text-2xl font-bold text-gray-800">
                  Rp {data.pinjaman.aktif.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-600">Jatuh Tempo Berikutnya</span><span className="font-medium text-brand-red-600">{data.pinjaman.jatuhTempo}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Sisa Angsuran</span><span className="font-medium">{data.pinjaman.sisaAngsuran} dari {data.pinjaman.totalAngsuran} bulan</span></div>
            </div>
          </div>
          <Link href="/dashboard/anggota/pinjaman" className="block border-t border-gray-100 bg-gray-50 hover:bg-gray-100 p-4 text-center text-sm font-medium text-brand-red-600 rounded-b-xl transition">
            Lihat Detail Pinjaman
          </Link>
        </div>
        
        {/* KARTU INFORMASI ANGGOTA */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Informasi Anggota</h3>
                <p className="text-lg font-bold text-gray-800">{data.namaAnggota}</p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-600">Nomor Anggota</span><span className="font-medium">{data.nomorAnggota}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Tanggal Bergabung</span><span className="font-medium">{data.tanggalBergabung}</span></div>
            </div>
          </div>
          <Link href="/dashboard/anggota/profil" className="block border-t border-gray-100 bg-gray-50 hover:bg-gray-100 p-4 text-center text-sm font-medium text-brand-red-600 rounded-b-xl transition">
            Lihat Profil Saya
          </Link>
        </div>

      </div>
    </div>
  );
}