"use client";
import React from 'react';
import Button from '@/components/Button'; // Pastikan path import Button benar

// Tipe data untuk histori pinjaman
type Pinjaman = {
  tanggal: string;
  keterangan: string;
  jumlah: number;
  status: 'Lunas' | 'Aktif';
};

export default function HalamanPinjaman() {
  // Data contoh, nanti diganti dengan API
  const historiPinjaman: Pinjaman[] = [
    { tanggal: '2025-01-15', keterangan: 'Pinjaman Modal Usaha', jumlah: 5000000, status: 'Aktif' },
    { tanggal: '2024-06-10', keterangan: 'Pinjaman Renovasi', jumlah: 2000000, status: 'Lunas' },
  ];

  const handleAjukanPinjaman = () => {
    // Nanti akan membuka modal atau halaman form baru
    alert('Membuka form pengajuan pinjaman...');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Pinjaman</h1>
          <p className="mt-2 text-gray-600">Lacak pinjaman Anda dan ajukan yang baru.</p>
        </div>
        <Button onClick={handleAjukanPinjaman}>
          Ajukan Pinjaman Baru
        </Button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Histori Pinjaman Anda</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Keterangan</th>
                <th className="p-4 font-medium text-right">Jumlah (Rp)</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {historiPinjaman.map((pinjaman, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-4">{pinjaman.tanggal}</td>
                  <td className="p-4 font-medium text-gray-800">{pinjaman.keterangan}</td>
                  <td className="p-4 text-right">{pinjaman.jumlah.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      pinjaman.status === 'Lunas' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pinjaman.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}