// Lokasi: frontend/app/dashboard/anggota/notulen/page.tsx
"use client";

import { Download } from "lucide-react";

// Data contoh untuk notulen rapat
const mockNotulen = [
  {
    tanggal: "25 Agustus 2025",
    judul: "Rapat Anggota Tahunan (RAT) 2025",
    fileUrl: "#", // Nanti diisi link ke file PDF
  },
  {
    tanggal: "10 Juni 2025",
    judul: "Rapat Sosialisasi Produk Pinjaman Baru",
    fileUrl: "#",
  },
];

export default function HalamanNotulen() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Arsip Notulen Rapat</h1>
      <p className="mt-2 text-gray-600">Lihat dan unduh hasil rapat anggota yang telah dilaksanakan.</p>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4 font-medium">Tanggal Rapat</th>
                <th className="p-4 font-medium">Judul Rapat</th>
                <th className="p-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mockNotulen.map((notulen, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-4">{notulen.tanggal}</td>
                  <td className="p-4 font-medium text-gray-800">{notulen.judul}</td>
                  <td className="p-4 text-center">
                    <a 
                      href={notulen.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-brand-red-600 hover:underline"
                    >
                      <Download size={16} />
                      <span>Unduh</span>
                    </a>
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