// Lokasi: frontend/app/dashboard/admin/persetujuan-koperasi/page.tsx
"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Search, Eye, FileText } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";

// --- Tipe Data (sesuaikan dengan data pendaftaran koperasi) ---
type CalonKoperasi = {
  id: string; // ID Pendaftaran atau Tenant ID
  namaKoperasi: string;
  subdomain: string;
  namaPic: string; // Nama pengurus yang mendaftar
  emailPic: string;
  teleponPic: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  tanggalDaftar: string;
  // URL Dokumen (contoh, sesuaikan nama field jika berbeda)
  urlPengesahan: string | null;
  urlDaftarUmum: string | null;
  urlAkte: string | null;
  urlNpwp: string | null;
};

// --- Data Contoh (Ganti dengan data dari API nanti) ---
const mockCalonKoperasi: CalonKoperasi[] = [
  {
    id: "tenant-pending-001",
    namaKoperasi: "Koperasi Warga Sejahtera",
    subdomain: "wargasejahtera",
    namaPic: "Rina Pengelola",
    emailPic: "rina.p@example.com",
    teleponPic: "081234567890",
    provinsi: "Sulawesi Selatan",
    kota: "Kota Makassar",
    kecamatan: "Tamalanrea",
    kelurahan: "Tamalanrea Indah",
    tanggalDaftar: "20 Oktober 2025",
    urlPengesahan: "#", // Placeholder URL
    urlDaftarUmum: "#",
    urlAkte: "#",
    urlNpwp: "#",
  },
  // Tambahkan data mock lain jika perlu
];

// --- Komponen Modal Detail Koperasi ---
const DetailKoperasiModal = ({ koperasi, onClose }: { koperasi: CalonKoperasi; onClose: () => void; }) => {
  const infoKoperasi = [
    { label: "Nama Koperasi", value: koperasi.namaKoperasi },
    { label: "Subdomain Diajukan", value: koperasi.subdomain },
    { label: "Tanggal Daftar", value: new Date(koperasi.tanggalDaftar).toLocaleDateString('id-ID') },
  ];
  const infoLokasi = [
    { label: "Provinsi", value: koperasi.provinsi },
    { label: "Kabupaten/Kota", value: koperasi.kota },
    { label: "Kecamatan", value: koperasi.kecamatan },
    { label: "Desa/Kelurahan", value: koperasi.kelurahan },
  ];
   const infoPIC = [
    { label: "Nama PIC", value: koperasi.namaPic },
    { label: "Email PIC", value: koperasi.emailPic },
    { label: "Telepon PIC", value: koperasi.teleponPic },
  ];
  const dokumen = [
    { label: "Pengesahan Badan Hukum", url: koperasi.urlPengesahan },
    { label: "Daftar Umum Koperasi", url: koperasi.urlDaftarUmum },
    { label: "Akte Notaris Pendirian", url: koperasi.urlAkte },
    { label: "NPWP Koperasi", url: koperasi.urlNpwp },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Detail Permohonan Koperasi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
        </div>
        {/* Konten Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Info Koperasi */}
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Koperasi</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {infoKoperasi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800">{item.value}</dd></div>))}
              </dl>
          </div>
          {/* Info Lokasi */}
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Lokasi</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {infoLokasi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800">{item.value}</dd></div>))}
              </dl>
          </div>
          {/* Info PIC */}
           <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Penanggung Jawab (PIC)</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {infoPIC.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800">{item.value}</dd></div>))}
              </dl>
          </div>
          {/* Dokumen */}
          <div>
              <h3 className="font-semibold text-brand-red-600 mb-2">Dokumen Pendukung</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                 {dokumen.map(doc => (
                    <div key={doc.label}>
                        <p className="text-sm text-gray-500">{doc.label}</p>
                        {doc.url ? (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium">
                                <FileText size={14} /> Lihat Dokumen
                            </a>
                        ) : (
                            <span className="text-sm text-gray-400 italic">Tidak diunggah</span>
                        )}
                    </div>
                 ))}
              </div>
          </div>
        </div>
        {/* Footer Modal */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button>
           {/* Tambahkan tombol Setujui/Tolak di sini jika diperlukan */}
        </div>
      </div>
    </div>
  );
};


// --- Komponen Utama Halaman ---
export default function PersetujuanKoperasiPage() {
  const [selectedKoperasi, setSelectedKoperasi] = useState<CalonKoperasi | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State untuk pencarian

   // Filter data berdasarkan searchTerm
  const filteredKoperasi = mockCalonKoperasi.filter(koperasi =>
    koperasi.namaKoperasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    koperasi.namaPic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (namaKoperasi: string, action: 'approve' | 'reject') => {
    const message = action === 'approve'
      ? `Apakah Anda yakin ingin MENYETUJUI pendaftaran koperasi "${namaKoperasi}"?`
      : `Apakah Anda yakin ingin MENOLAK pendaftaran koperasi "${namaKoperasi}"?`;

    if (window.confirm(message)) {
      // TODO: Panggil API backend untuk approve/reject
      alert(`Simulasi: Pendaftaran "${namaKoperasi}" telah di-${action === 'approve' ? 'setujui' : 'tolak'}.`);
      // Optional: Hapus item dari list setelah aksi atau refresh data
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Persetujuan Koperasi Baru"
        description="Verifikasi dan proses permohonan pendaftaran koperasi baru."
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          {/* Area Pencarian */}
           <div className="mb-4">
             <div className="relative w-full max-w-sm">
               <input
                 type="text"
                 placeholder="Cari nama koperasi atau PIC..."
                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
             </div>
           </div>

          {/* Tabel Pendaftar */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">Nama Koperasi</th>
                  <th className="p-4 font-medium">Nama PIC</th>
                  <th className="p-4 font-medium">Email PIC</th>
                  <th className="p-4 font-medium">Tanggal Daftar</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredKoperasi.length > 0 ? (
                  filteredKoperasi.map((calon) => (
                    <tr key={calon.id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{calon.namaKoperasi}</p>
                        <p className="text-xs text-gray-500">{calon.kelurahan}, {calon.kecamatan}</p>
                      </td>
                      <td className="p-4">{calon.namaPic}</td>
                      <td className="p-4">{calon.emailPic}</td>
                      <td className="p-4">{new Date(calon.tanggalDaftar).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 text-center space-x-1">
                        <button
                          onClick={() => setSelectedKoperasi(calon)}
                          className="p-1.5 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition"
                          title="Lihat Detail Pendaftar"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleAction(calon.namaKoperasi, 'approve')}
                          className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition"
                          title="Setujui Pendaftaran"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleAction(calon.namaKoperasi, 'reject')}
                          className="p-1.5 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition"
                          title="Tolak Pendaftaran"
                        >
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      {searchTerm ? "Tidak ada koperasi yang cocok dengan pencarian." : "Tidak ada permohonan koperasi baru."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tampilkan Modal jika ada koperasi yang dipilih */}
      {selectedKoperasi && <DetailKoperasiModal koperasi={selectedKoperasi} onClose={() => setSelectedKoperasi(null)} />}
    </div>
  );
}