// Lokasi: frontend/app/dashboard/admin/notulen-rapat-anggota/page.tsx
"use client";

import { useState, useMemo } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, FileText, Download, Edit, Trash2, X } from "lucide-react";

// --- Tipe Data ---
type NotulenRapat = {
  id: string;
  judul: string;
  tanggal: string; // Format YYYY-MM-DD
  agenda: string[];
  jumlahHadir: number;
  fileUrl?: string; // URL ke file PDF notulen jika ada
};

// --- Data Contoh ---
const mockNotulen: NotulenRapat[] = [
  { 
    id: 'rat001', 
    judul: 'Rapat Anggota Tahunan (RAT) 2025', 
    tanggal: '2025-03-15',
    agenda: ['Laporan Pertanggungjawaban Pengurus', 'Pembahasan Rencana Kerja 2026', 'Pemilihan Pengawas Baru'],
    jumlahHadir: 120,
    fileUrl: '#'
  },
  { 
    id: 'rat002', 
    judul: 'Rapat Anggota Luar Biasa - Perubahan AD/ART', 
    tanggal: '2024-11-20',
    agenda: ['Sosialisasi usulan perubahan Anggaran Dasar', 'Persetujuan perubahan pasal 15', 'Lain-lain'],
    jumlahHadir: 95,
    fileUrl: '#'
  },
  { 
    id: 'rat003', 
    judul: 'Rapat Anggota Tahunan (RAT) 2024', 
    tanggal: '2024-03-10',
    agenda: ['Laporan Keuangan Tahun 2023', 'Pembagian Sisa Hasil Usaha (SHU)'],
    jumlahHadir: 115,
    fileUrl: '#'
  },
];

export default function NotulenRapatAnggotaPage() {
  const [filters, setFilters] = useState({
    search: '',
    tanggalMulai: '',
    tanggalSelesai: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', tanggalMulai: '', tanggalSelesai: '' });
  };

  const filteredNotulen = useMemo(() => {
    return mockNotulen.filter(notulen => {
      const tanggalRapat = new Date(notulen.tanggal);
      const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
      const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;

      if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
      if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);

      return (
        notulen.judul.toLowerCase().includes(filters.search.toLowerCase()) &&
        (!tanggalMulai || tanggalRapat >= tanggalMulai) &&
        (!tanggalSelesai || tanggalRapat <= tanggalSelesai)
      );
    });
  }, [filters]);

  const handleTambahNotulen = () => alert("Membuka halaman untuk membuat/mengunggah notulen baru...");

  return (
    <div>
      <AdminPageHeader
        title="Buku Notulen Rapat Anggota"
        description="Arsipkan dan kelola semua notulensi dari Rapat Anggota."
        actionButton={
            <Button onClick={handleTambahNotulen} variant="primary">
                <PlusCircle size={20} /><span>Tambah Notulen</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        
        {/* --- KOP SURAT --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">
            Buku Daftar Notulen Rapat Anggota
          </h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span></div>
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">KOTA MAKASSAR</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span></div>
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL CETAK</span><span className="text-gray-800 font-medium">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* --- Area Filter --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Judul Rapat</label>
                    <div className="relative">
                        <input id="search" name="search" type="text" placeholder="Contoh: RAT 2025..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Rentang Tanggal Rapat</label>
                    <div className="flex items-center gap-2">
                        <input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                        <span className="text-gray-500">s/d</span>
                        <input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                    </div>
                </div>
            </div>
             <div className="flex justify-end mt-3">
                <Button onClick={resetFilters} variant="outline" className="text-sm px-4 py-1"><X size={16} /> Reset</Button>
             </div>
          </div>

          {/* --- Daftar Notulen (Kartu) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotulen.map((notulen) => (
              <div key={notulen.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition">
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500">{new Date(notulen.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <h3 className="font-bold text-lg text-brand-red-700 mt-1">{notulen.judul}</h3>
                  <p className="text-xs text-gray-600">Jumlah Hadir: {notulen.jumlahHadir} orang</p>
                </div>
                <div className="py-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Agenda Utama:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {notulen.agenda.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button variant="outline" className="text-xs px-3 py-1"><FileText size={14}/> Lihat Detail</Button>
                  {notulen.fileUrl && <a href={notulen.fileUrl} download><Button variant="outline" className="text-xs px-3 py-1"><Download size={14}/> Unduh</Button></a>}
                  <Button variant="outline" className="text-xs px-3 py-1"><Edit size={14}/> Edit</Button>
                  <Button variant="outline" className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={14}/> Hapus</Button>
                </div>
              </div>
            ))}
            {filteredNotulen.length === 0 && (
              <div className="lg:col-span-2 text-center p-10 text-gray-500">
                  Tidak ada notulen yang sesuai dengan filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}