// Lokasi: frontend/app/dashboard/admin/website/berita/page.tsx
"use client";

import { useState, useMemo } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Edit, Trash2, X, Eye } from "lucide-react";

// --- Tipe Data ---
type Artikel = {
  id: string;
  judul: string;
  tanggalPublikasi: string; // Format YYYY-MM-DD
  penulis: string;
  status: 'Dipublikasikan' | 'Draft';
  dilihat: number;
};

// --- Data Contoh ---
const mockArtikel: Artikel[] = [
  { id: 'art001', judul: 'Rapat Anggota Tahunan (RAT) 2025 Sukses Digelar', tanggalPublikasi: '2025-03-16', penulis: 'Andi Wijaya', status: 'Dipublikasikan', dilihat: 258 },
  { id: 'art002', judul: 'Koperasi Merah Putih Buka Unit Usaha Baru: Toko Sembako', tanggalPublikasi: '2025-02-20', penulis: 'Andi Wijaya', status: 'Dipublikasikan', dilihat: 412 },
  { id: 'art003', judul: 'Panduan Pengajuan Pinjaman Online untuk Anggota', tanggalPublikasi: '2025-01-05', penulis: 'Siti Aminah', status: 'Dipublikasikan', dilihat: 1024 },
  { id: 'art004', judul: 'Rencana Pelatihan Kewirausahaan [DRAFT]', tanggalPublikasi: '2025-09-10', penulis: 'Andi Wijaya', status: 'Draft', dilihat: 0 },
];

export default function ManajemenBeritaPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', status: '' });
  };

  const filteredArtikel = useMemo(() => {
    return mockArtikel.filter(artikel => {
      return (
        artikel.judul.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.status === '' || artikel.status === filters.status)
      );
    });
  }, [filters]);

  const handleTambahArtikel = () => alert("Membuka editor untuk membuat artikel baru...");
  const handleHapus = (judul: string) => {
    if(window.confirm(`Apakah Anda yakin ingin menghapus artikel "${judul}"?`)){
      alert(`Simulasi: Artikel "${judul}" telah dihapus.`);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Berita & Artikel"
        description="Buat, edit, dan kelola semua konten berita untuk landing page."
        actionButton={
            <Button onClick={handleTambahArtikel} variant="primary">
                <PlusCircle size={20} /><span>Tulis Artikel Baru</span>
            </Button>
        }
      />
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-700">Daftar Artikel</h2>

          {/* --- Area Filter --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Judul Artikel</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Judul..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua</option>
                <option value="Dipublikasikan">Dipublikasikan</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div>
              <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">Judul Artikel</th>
                  <th className="p-4 font-medium">Tanggal Publikasi</th>
                  <th className="p-4 font-medium text-center">Dilihat</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtikel.map((artikel) => (
                  <tr key={artikel.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{artikel.judul}</p>
                      <p className="text-xs text-gray-500">Penulis: {artikel.penulis}</p>
                    </td>
                    <td className="p-4">{new Date(artikel.tanggalPublikasi).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                    <td className="p-4 text-center">{artikel.dilihat.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          artikel.status === 'Dipublikasikan' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                          {artikel.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                        <Button variant="outline" className="text-xs p-2"><Eye size={16}/></Button>
                        <Button variant="outline" className="text-xs p-2"><Edit size={16}/></Button>
                        <Button onClick={() => handleHapus(artikel.judul)} variant="outline" className="text-xs p-2 text-red-600 border-red-200 hover:bg-red-50"><Trash2 size={16}/></Button>
                    </td>
                  </tr>
                ))}
                {filteredArtikel.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      Tidak ada artikel yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}