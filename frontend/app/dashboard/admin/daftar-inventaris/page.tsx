// Lokasi: frontend/app/dashboard/admin/daftar-inventaris/page.tsx
"use client";

import { useState, useMemo } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Archive, Package, DollarSign, Download, X, Tag } from "lucide-react"; // <-- Ikon Tag ditambahkan

// --- Tipe Data diperbarui dengan 'jenis' ---
type Inventaris = {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  jenis: 'Elektronik' | 'Perabotan' | 'ATK' | 'Kendaraan' | 'Lainnya'; // <-- Kolom baru
  tanggalPerolehan: string;
  jumlah: number;
  satuan: string;
  nilaiPerolehan: number;
  kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
  lokasi: string;
};

// --- Data Contoh diperbarui dengan 'jenis' ---
const mockInventaris: Inventaris[] = [
  { id: 'inv001', kodeBarang: 'KMP-LP-01', namaBarang: 'Laptop Lenovo ThinkPad', jenis: 'Elektronik', tanggalPerolehan: '2025-01-10', jumlah: 3, satuan: 'Unit', nilaiPerolehan: 12500000, kondisi: 'Baik', lokasi: 'Ruang Kantor' },
  { id: 'inv002', kodeBarang: 'KMP-PR-01', namaBarang: 'Printer Epson L3210', jenis: 'Elektronik', tanggalPerolehan: '2025-01-10', jumlah: 1, satuan: 'Unit', nilaiPerolehan: 2500000, kondisi: 'Baik', lokasi: 'Ruang Kantor' },
  { id: 'inv003', kodeBarang: 'KMP-MJ-01', namaBarang: 'Meja Kantor', jenis: 'Perabotan', tanggalPerolehan: '2024-12-20', jumlah: 5, satuan: 'Buah', nilaiPerolehan: 750000, kondisi: 'Baik', lokasi: 'Ruang Rapat' },
  { id: 'inv004', kodeBarang: 'KMP-AC-01', namaBarang: 'AC Sharp 1 PK', jenis: 'Elektronik', tanggalPerolehan: '2024-11-15', jumlah: 1, satuan: 'Unit', nilaiPerolehan: 3500000, kondisi: 'Perlu Perbaikan', lokasi: 'Ruang Kantor' },
  { id: 'inv005', kodeBarang: 'KMP-MTR-01', namaBarang: 'Motor Honda Beat', jenis: 'Kendaraan', tanggalPerolehan: '2023-05-20', jumlah: 1, satuan: 'Unit', nilaiPerolehan: 18000000, kondisi: 'Baik', lokasi: 'Parkiran' },
  { id: 'inv006', kodeBarang: 'KMP-ATK-01', namaBarang: 'Kertas A4 1 Rim', jenis: 'ATK', tanggalPerolehan: '2025-09-01', jumlah: 10, satuan: 'Rim', nilaiPerolehan: 50000, kondisi: 'Baik', lokasi: 'Lemari ATK' },
];

const mockTotalInventaris = {
    totalNilai: 43750000, // Disesuaikan dengan data baru
    jumlahItem: 21,    // Disesuaikan dengan data baru
};

export default function DaftarInventarisPage() {
  const [filters, setFilters] = useState({
    search: '',
    kondisi: '',
    jenis: '', // <-- State baru untuk filter jenis
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const resetFilters = () => {
    setFilters({ search: '', kondisi: '', jenis: '' });
  };

  const filteredInventaris = useMemo(() => {
    return mockInventaris.filter(item => {
      return (
        item.namaBarang.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.kondisi === '' || item.kondisi === filters.kondisi) &&
        (filters.jenis === '' || item.jenis === filters.jenis) // <-- Logika filter baru
      );
    });
  }, [filters]);

  const handleTambahInventaris = () => alert("Membuka form untuk menambah data inventaris baru...");

  return (
    <div>
      <AdminPageHeader
        title="Buku Daftar Inventaris"
        description="Kelola daftar semua aset dan barang milik koperasi."
        actionButton={
            <Button onClick={handleTambahInventaris} variant="primary">
                <PlusCircle size={20} /><span>Tambah Inventaris</span>
            </Button>
        }
      />

      {/* --- Kartu Ringkasan (tidak berubah) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full"><DollarSign className="h-6 w-6 text-green-600" /></div>
                <div>
                    <p className="text-sm text-gray-500">Total Nilai Perolehan Aset</p>
                    <p className="text-xl font-bold text-gray-800">Rp {mockTotalInventaris.totalNilai.toLocaleString('id-ID')}</p>
                </div>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full"><Package className="h-6 w-6 text-blue-600" /></div>
                <div>
                    <p className="text-sm text-gray-500">Jumlah Total Barang</p>
                    <p className="text-xl font-bold text-gray-800">{mockTotalInventaris.jumlahItem} Item</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">Daftar Aset Koperasi</h2>
            <Button variant="outline"><Download size={18}/> <span>Ekspor</span></Button>
          </div>

          {/* --- Area Filter diperbarui dengan filter jenis --- */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Nama Barang</label>
              <div className="relative">
                <input id="search" name="search" type="text" placeholder="Contoh: Laptop..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="jenis" className="block text-sm font-medium text-gray-600 mb-1">Jenis Barang</label>
              <select id="jenis" name="jenis" value={filters.jenis} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua Jenis</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Perabotan">Perabotan</option>
                <option value="ATK">ATK</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label htmlFor="kondisi" className="block text-sm font-medium text-gray-600 mb-1">Kondisi Barang</label>
              <select id="kondisi" name="kondisi" value={filters.kondisi} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                <option value="">Semua Kondisi</option>
                <option value="Baik">Baik</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Rusak">Rusak</option>
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
                  <th className="p-4 font-medium">Nama Barang</th>
                  <th className="p-4 font-medium">Jenis</th>{/* <-- Kolom baru */}
                  <th className="p-4 font-medium text-center">Jumlah</th>
                  <th className="p-4 font-medium text-right">Nilai (Rp)</th>
                  <th className="p-4 font-medium text-center">Kondisi</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventaris.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{item.namaBarang}</div>
                      <div className="text-xs text-gray-500">Kode: {item.kodeBarang}</div>
                    </td>
                     {/* Kolom baru */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-gray-400"/>
                        {item.jenis}
                      </div>
                    </td>
                    <td className="p-4 text-center">{item.jumlah} {item.satuan}</td>
                    <td className="p-4 text-right font-semibold">{item.nilaiPerolehan.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            item.kondisi === 'Baik' ? 'bg-green-100 text-green-700' :
                            item.kondisi === 'Perlu Perbaikan' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {item.kondisi}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-blue-600 hover:underline text-xs font-medium">
                        Edit
                      </button>
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