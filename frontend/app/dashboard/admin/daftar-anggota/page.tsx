"use client"; 

import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search } from "lucide-react";

// Data contoh tidak berubah
const mockAnggota = [
  {
    no: 1,
    namaLengkap: "Alviansyah Burhani",
    jenisKelamin: "Laki-laki",
    pekerjaan: "Wiraswasta",
    tanggalMasuk: "15 Januari 2024",
    status: "Aktif",
  },
  {
    no: 2,
    namaLengkap: "Budi Santoso",
    jenisKelamin: "Laki-laki",
    pekerjaan: "Karyawan Swasta",
    tanggalMasuk: "20 Februari 2024",
    status: "Aktif",
  },
  {
    no: 3,
    namaLengkap: "Citra Lestari",
    jenisKelamin: "Perempuan",
    pekerjaan: "Ibu Rumah Tangga",
    tanggalMasuk: "05 Maret 2024",
    status: "Berhenti",
  },
];


export default function DaftarAnggotaPage() {
  return (
    <div>
      <AdminPageHeader
        title="Manajemen Anggota"
        description="Kelola, tambah, dan cari data anggota koperasi."
        actionButton={
          <Button>
            <PlusCircle size={20} />
            <span>Tambah Anggota</span>
          </Button>
        }
      />

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


        {/* 2. Konten tabel ada di bawah header, dalam satu kartu yang sama */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Cari anggota..."
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
                  <th className="p-4 font-medium">Jenis Kelamin</th>
                  <th className="p-4 font-medium">Pekerjaan</th>
                  <th className="p-4 font-medium">Tanggal Masuk</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mockAnggota.map((anggota) => (
                  <tr key={anggota.no} className="border-b hover:bg-gray-50 text-sm">
                    {/* ... (kolom lain tidak berubah) ... */}
                    <td className="p-4 font-medium">{anggota.no}.</td>
                    <td className="p-4">{anggota.namaLengkap}</td>
                    <td className="p-4">{anggota.jenisKelamin}</td>
                    <td className="p-4">{anggota.pekerjaan}</td>
                    <td className="p-4">{anggota.tanggalMasuk}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        anggota.status === 'Aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {anggota.status}
                      </span>
                    </td>

                    {/* --- PERUBAHAN DI SINI --- */}
                    <td className="p-4 text-center space-x-4">
                      <button className="text-blue-600 hover:underline font-medium">Detail</button>
                      <button className="text-green-600 hover:underline font-medium">Edit</button>
                      
                      {/* Tombol Hapus hanya muncul jika status 'Berhenti' */}
                      {anggota.status === 'Berhenti' && (
                        <button 
                          onClick={() => handleHapus(anggota.namaLengkap, anggota.no)}
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