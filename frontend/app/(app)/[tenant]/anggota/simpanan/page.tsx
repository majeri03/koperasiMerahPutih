"use client";
import React, { useState, useEffect } from 'react';

// Tipe data untuk transaksi simpanan
type Simpanan = {
  tanggal: string;
  jenis: 'Wajib' | 'Pokok' | 'Sukarela';
  keterangan: string;
  debit: number;
  kredit: number;
  saldo: number;
};

export default function HalamanSimpanan() {
  const [transaksi, setTransaksi] = useState<Simpanan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    const fetchSimpanan = () => {
      const mockData: Simpanan[] = [
        { tanggal: '2025-08-05', jenis: 'Wajib', keterangan: 'Simpanan Wajib Agustus', debit: 0, kredit: 100000, saldo: 5750000 },
        { tanggal: '2025-07-20', jenis: 'Sukarela', keterangan: 'Setoran tunai', debit: 0, kredit: 50000, saldo: 5650000 },
        { tanggal: '2025-07-05', jenis: 'Wajib', keterangan: 'Simpanan Wajib Juli', debit: 0, kredit: 100000, saldo: 5600000 },
        { tanggal: '2025-06-15', jenis: 'Sukarela', keterangan: 'Penarikan', debit: 200000, kredit: 0, saldo: 5500000 },
        { tanggal: '2025-06-05', jenis: 'Wajib', keterangan: 'Simpanan Wajib Juni', debit: 0, kredit: 100000, saldo: 5700000 },
      ];
      setTransaksi(mockData);
      setLoading(false);
    };

    fetchSimpanan();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Riwayat Simpanan</h1>
      <p className="mt-2 text-gray-600">Lacak semua transaksi simpanan Anda di sini.</p>

      <div className="mt-8 bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">Memuat data...</td>
                </tr>
              ) : (
                transaksi.map((trx, index) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}