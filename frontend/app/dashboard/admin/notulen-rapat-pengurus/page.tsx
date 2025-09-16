// Lokasi: frontend/app/dashboard/admin/notulen-rapat-pengurus/page.tsx
"use client";

import { useState, useMemo } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, FileText, Download, Edit, Trash2, X } from "lucide-react";

// --- Tipe Data (berdasarkan file 08. Buku Notulen Rapat Pengurus.xls) ---
type NotulenRapat = {
  id: string;
  judul: string;
  tanggal: string;
  agenda: string[];
  jumlahHadir: number;
  jumlahPengurus: number;
  fileUrl?: string;
};

// --- Data Contoh ---
const mockNotulen: NotulenRapat[] = [
  { 
    id: 'nrp001', 
    judul: 'Rapat Rutin Pengurus - September 2025', 
    tanggal: '2025-09-05',
    agenda: ['Evaluasi Kinerja Bulan Agustus', 'Rencana Promosi Simpanan Sukarela', 'Pembahasan Laporan Pengawas'],
    jumlahHadir: 5,
    jumlahPengurus: 5,
    fileUrl: '#'
  },
  { 
    id: 'nrp002', 
    judul: 'Rapat Insidental - Persiapan RAT 2025', 
    tanggal: '2025-02-15',
    agenda: ['Pembentukan Panitia RAT', 'Penentuan Jadwal dan Lokasi', 'Pembahasan Materi Laporan'],
    jumlahHadir: 4,
    jumlahPengurus: 5,
    fileUrl: '#'
  },
];

export default function NotulenRapatPengurusPage() {
  const [filters, setFilters] = useState({ search: '' });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => setFilters({ search: '' });

  const filteredNotulen = useMemo(() => {
    return mockNotulen.filter(notulen => 
      notulen.judul.toLowerCase().includes(filters.search.toLowerCase())
    );
  }, [filters]);

  const handleTambahNotulen = () => alert("Membuka halaman untuk membuat notulen rapat pengurus baru...");

  return (
    <div>
      <AdminPageHeader
        title="Buku Notulen Rapat Pengurus"
        description="Arsipkan dan kelola semua notulensi dari rapat internal pengurus."
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
            Buku Daftar Notulen Rapat Pengurus
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-end gap-4">
              <div className="flex-grow">
                <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Judul Rapat</label>
                <div className="relative">
                  <input id="search" name="search" type="text" placeholder="Ketik judul rapat..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <Button onClick={resetFilters} variant="outline"><X size={16} /> Reset</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotulen.map((notulen) => (
              <div key={notulen.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition">
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500">{new Date(notulen.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <h3 className="font-bold text-lg text-brand-red-700 mt-1">{notulen.judul}</h3>
                  <p className="text-xs text-gray-600">Kehadiran: {notulen.jumlahHadir} dari {notulen.jumlahPengurus} pengurus</p>
                </div>
                <div className="py-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Agenda Utama:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {notulen.agenda.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <Button variant="outline" className="text-xs px-3 py-1"><FileText size={14}/> Lihat Detail</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}