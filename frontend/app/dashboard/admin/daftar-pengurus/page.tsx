// Lokasi: frontend/app/dashboard/admin/daftar-pengurus/page.tsx
"use client";

import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search } from "lucide-react";

// Data contoh disesuaikan dengan kolom baru dari buku pengurus
const mockPengurus = [
  {
    no: 1,
    namaLengkap: "Andi Wijaya",
    nomorKeanggotaan: "AGT-001",
    jabatan: "Ketua",
    tanggalDiangkat: "10 Januari 2024",
    tanggalBerhenti: null, // null berarti masih aktif
  },
  {
    no: 2,
    namaLengkap: "Siti Aminah",
    nomorKeanggotaan: "AGT-002",
    jabatan: "Sekretaris",
    tanggalDiangkat: "10 Januari 2024",
    tanggalBerhenti: null,
  },
  {
    no: 3,
    namaLengkap: "Bambang Susilo",
    nomorKeanggotaan: "AGT-003",
    jabatan: "Bendahara",
    tanggalDiangkat: "10 Januari 2024",
    tanggalBerhenti: null,
  },
  {
    no: 4,
    namaLengkap: "Dewi Lestari",
    nomorKeanggotaan: "AGT-004",
    jabatan: "Ketua",
    tanggalDiangkat: "05 Januari 2019",
    tanggalBerhenti: "09 Januari 2024", // Contoh yang sudah berhenti
  },
];

export default function DaftarPengurusPage() {
  return (
    <div>
      <div className="mb-6">
        <AdminPageHeader
          title="Manajemen Pengurus"
          description="Kelola data pengurus koperasi sesuai buku daftar pengurus."
          actionButton={
            <Button>
              <PlusCircle size={20} />
              <span>Tambah Pengurus</span>
            </Button>
          }
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* --- KODE KOP SURAT DITAMBAHKAN DI SINI --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Pengurus
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            {/* Kolom Kiri */}
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KOPERASI</span>
                <span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">KAB / KOTA</span>
                <span className="text-gray-800 font-medium">KOTA MAKASSAR</span>
              </div>
            </div>
            {/* Kolom Kanan */}
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">NO. BADAN HUKUM</span>
                <span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span>
              </div>
              <div className="flex justify-between border-b border-dotted">
                <span className="font-semibold text-gray-500">TANGGAL</span>
                <span className="text-gray-800 font-medium">12 September 2025</span>
              </div>
            </div>
          </div>
        </div>
        {/* ------------------------------------------- */}

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Cari pengurus..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">No.</th>
                  <th className="p-4 font-medium">Nama Lengkap</th>
                  <th className="p-4 font-medium">No. Anggota</th>
                  <th className="p-4 font-medium">Jabatan</th>
                  <th className="p-4 font-medium">Tanggal Diangkat</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mockPengurus.map((pengurus) => (
                  <tr key={pengurus.no} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-4 font-medium">{pengurus.no}.</td>
                    <td className="p-4">{pengurus.namaLengkap}</td>
                    <td className="p-4">{pengurus.nomorKeanggotaan}</td>
                    <td className="p-4">{pengurus.jabatan}</td>
                    <td className="p-4">{pengurus.tanggalDiangkat}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        !pengurus.tanggalBerhenti
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {!pengurus.tanggalBerhenti ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                      </td>
                    {/* --- PERUBAHAN DI SINI --- */}
                    <td className="p-4 text-center space-x-4">
                      <button className="text-blue-600 hover:underline font-medium">Detail</button>
                      <button className="text-green-600 hover:underline font-medium">Edit</button>
                      
                      {/* 2. Tombol hapus ditambahkan dengan logika kondisional */}
                      {pengurus.tanggalBerhenti && (
                        <button
                          onClick={() => handleHapus(pengurus.namaLengkap, pengurus.no)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Hapus
                        </button>
                      )}
                    
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}