// Lokasi: frontend/app/dashboard/admin/pinjaman-anggota/page.tsx
"use client";

import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search } from "lucide-react";

// Data contoh untuk anggota yang pinjamannya sedang ditampilkan
const selectedAnggota = {
  nama: "Budi Santoso",
  nomorAnggota: "AGT-002",
  pinjaman: {
    totalPinjaman: 5000000,
    sisaPinjaman: 3000000,
    angsuranLunas: 4,
    totalAngsuran: 10,
  },
  // Data contoh untuk histori angsuran
  histori: [
    { tanggal: '10 Sep 2025', keterangan: 'Angsuran ke-4', jumlah: 500000, sisa: 3000000 },
    { tanggal: '10 Agu 2025', keterangan: 'Angsuran ke-3', jumlah: 500000, sisa: 3500000 },
    { tanggal: '10 Jul 2025', keterangan: 'Angsuran ke-2', jumlah: 500000, sisa: 4000000 },
    { tanggal: '10 Jun 2025', keterangan: 'Angsuran ke-1', jumlah: 500000, sisa: 4500000 },
  ]
};

export default function PinjamanAnggotaPage() {
  const pinjamanProgress = (selectedAnggota.pinjaman.angsuranLunas / selectedAnggota.pinjaman.totalAngsuran) * 100;

  return (
    <div>
      <div className="mb-6">
        <AdminPageHeader
          title="Manajemen Pinjaman Anggota"
          description="Kelola data pinjaman dan angsuran untuk setiap anggota."
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Pinjaman Anggota
          </h2>
        </div>

        <div className="p-6">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <label htmlFor="search-anggota" className="block text-sm font-medium text-gray-700 mb-2">
              Cari Anggota (berdasarkan Nama atau Nomor Anggota)
            </label>
            <div className="relative w-full max-w-lg">
              <input
                id="search-anggota"
                type="text"
                placeholder="Ketik nama atau nomor anggota, lalu tekan Enter..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Bagian ini akan muncul setelah anggota ditemukan/dipilih */}
          {selectedAnggota && (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Menampilkan Pinjaman untuk:</p>
                  <h3 className="text-xl font-bold text-gray-800">{selectedAnggota.nama}</h3>
                  <p className="text-sm font-medium text-gray-500">{selectedAnggota.nomorAnggota}</p>
                </div>
                <Button>
                  <PlusCircle size={20} />
                  <span>Tambah Pinjaman Baru</span>
                </Button>
              </div>

              {/* Rincian Status Pinjaman */}
              <div className="mt-6">
                 <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 font-semibold">Sisa Pinjaman Aktif</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    Rp {selectedAnggota.pinjaman.sisaPinjaman.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600">Progres Angsuran</span>
                    <span className="font-semibold">{selectedAnggota.pinjaman.angsuranLunas} dari {selectedAnggota.pinjaman.totalAngsuran} Lunas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-600 h-4 rounded-full text-center text-white text-xs font-bold" style={{ width: `${pinjamanProgress}%` }}>
                      {pinjamanProgress.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabel Histori Angsuran */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-700 mb-4">Histori Angsuran</h4>
                <div className="overflow-x-auto border rounded-lg">
                   <table className="w-full text-left">
                      <thead className="border-b bg-gray-50 text-sm text-gray-600">
                        <tr>
                          <th className="p-4 font-medium">Tanggal</th>
                          <th className="p-4 font-medium">Keterangan</th>
                          <th className="p-4 font-medium text-right">Jumlah Bayar (Rp)</th>
                          <th className="p-4 font-medium text-right">Sisa Pinjaman (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAnggota.histori.map((trx, index) => (
                          <tr key={index} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                            <td className="p-4">{trx.tanggal}</td>
                            <td className="p-4 font-medium text-gray-800">{trx.keterangan}</td>
                            <td className="p-4 text-right text-green-600 font-medium">
                              {trx.jumlah.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4 text-right font-semibold text-gray-700">
                              {trx.sisa.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}