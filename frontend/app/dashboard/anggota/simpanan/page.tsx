// Lokasi: frontend/app/dashboard/admin/simpanan-anggota/page.tsx
"use client";

import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search } from "lucide-react";

// Nanti, data anggota akan diambil dari state atau API setelah pencarian
const selectedAnggota = {
  nama: "Alviansyah Burhani",
  nomorAnggota: "AGT-001",
  simpanan: {
    pokok: 500000,
    wajib: 4250000,
    sukarela: 1000000,
  },
  // Data contoh untuk histori transaksi
  histori: [
    { tanggal: '15 Sep 2025', keterangan: 'Setoran Wajib', jenis: 'Wajib', debit: 0, kredit: 100000, saldo: 5750000 },
    { tanggal: '01 Sep 2025', keterangan: 'Setoran Tunai', jenis: 'Sukarela', debit: 0, kredit: 250000, saldo: 5650000 },
    { tanggal: '15 Agu 2025', keterangan: 'Setoran Wajib', jenis: 'Wajib', debit: 0, kredit: 100000, saldo: 5400000 },
    { tanggal: '20 Jul 2025', keterangan: 'Penarikan Tunai', jenis: 'Sukarela', debit: 500000, kredit: 0, saldo: 5300000 },
  ]
};

export default function SimpananAnggotaPage() {
  return (
    <div>
      <div className="mb-6">
        <AdminPageHeader
          title="Manajemen Simpanan Anggota"
          description="Kelola data simpanan pokok, wajib, dan sukarela untuk setiap anggota."
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Simpanan Anggota
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
                  <p className="text-sm text-gray-500">Menampilkan Simpanan untuk:</p>
                  <h3 className="text-xl font-bold text-gray-800">{selectedAnggota.nama}</h3>
                  <p className="text-sm font-medium text-gray-500">{selectedAnggota.nomorAnggota}</p>
                </div>
                <Button>
                  <PlusCircle size={20} />
                  <span>Tambah Transaksi</span>
                </Button>
              </div>

              {/* Rincian Saldo Simpanan */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-semibold">Simpanan Pokok</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    Rp {selectedAnggota.simpanan.pokok.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-semibold">Simpanan Wajib</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    Rp {selectedAnggota.simpanan.wajib.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-semibold">Simpanan Sukarela</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    Rp {selectedAnggota.simpanan.sukarela.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Tabel Histori Transaksi */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-700 mb-4">Histori Transaksi Simpanan</h4>
                <div className="overflow-x-auto border rounded-lg">
                   <table className="w-full text-left">
                      <thead className="border-b bg-gray-50 text-sm text-gray-600">
                        <tr>
                          <th className="p-4 font-medium">Tanggal</th>
                          <th className="p-4 font-medium">Keterangan</th>
                          <th className="p-4 font-medium text-right">Debit (Rp)</th>
                          <th className="p-4 font-medium text-right">Kredit (Rp)</th>
                          <th className="p-4 font-medium text-right">Saldo (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAnggota.histori.map((trx, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                            <td className="p-4">{trx.tanggal}</td>
                            <td className="p-4">
                              <div className="font-medium text-gray-800">{trx.keterangan}</div>
                              <div className="text-xs text-gray-500">{trx.jenis}</div>
                            </td>
                            <td className="p-4 text-right text-red-600">
                              {trx.debit > 0 ? trx.debit.toLocaleString('id-ID') : '-'}
                            </td>
                            <td className="p-4 text-right text-green-600">
                              {trx.kredit > 0 ? trx.kredit.toLocaleString('id-ID') : '-'}
                            </td>
                            <td className="p-4 text-right font-semibold text-gray-700">
                              {trx.saldo.toLocaleString('id-ID')}
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