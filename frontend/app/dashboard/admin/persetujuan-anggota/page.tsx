// Lokasi: frontend/app/dashboard/admin/persetujuan-anggota/page.tsx
"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Search, Eye, FileText } from "lucide-react";
import AdminPageHeader from "@/components/AdminPageHeader";
import clsx from "clsx";

// --- Tipe Data Detail (sesuai dengan form pendaftaran lengkap) ---
type CalonAnggota = {
  id: string;
  // Info Akun
  fullName: string;
  email: string;
  // Data Pribadi
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string; // Seharusnya format tanggal
  gender: string;
  maritalStatus: string;
  occupation: string;
  // Alamat
  addressKtp: string;
  // Ahli Waris
  heirName: string;
  heirRelation: string;
  // Dokumen (URL)
  ktpScanUrl: string;
  photoUrl: string;
  // Lainnya
  tanggalDaftar: string;
};

// --- Data Contoh (dengan data yang lebih detail) ---
const mockCalonAnggota: CalonAnggota[] = [
  {
    id: "calon-001",
    fullName: "Siti Lestari",
    email: "siti.lestari@example.com",
    nik: "3301234567890001",
    placeOfBirth: "Cilacap",
    dateOfBirth: "1990-05-15",
    gender: "PEREMPUAN",
    maritalStatus: "KAWIN",
    occupation: "Ibu Rumah Tangga",
    addressKtp: "Jl. Merdeka No. 12, Desa Makmur, Kec. Sejahtera, Cilacap, Jawa Tengah",
    heirName: "Bambang Susilo",
    heirRelation: "Suami",
    ktpScanUrl: "#", // Dummy URL
    photoUrl: "#",   // Dummy URL
    tanggalDaftar: "14 September 2025",
  },
  // ... Tambahkan data mock lainnya jika perlu
];

// --- Komponen Modal untuk menampilkan detail ---
const DetailAnggotaModal = ({ anggota, onClose }: { anggota: CalonAnggota; onClose: () => void; }) => {
  const dataPribadi = [
    { label: "NIK", value: anggota.nik },
    { label: "Tempat, Tanggal Lahir", value: `${anggota.placeOfBirth}, ${new Date(anggota.dateOfBirth).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}` },
    { label: "Jenis Kelamin", value: anggota.gender.replace('_', ' ') },
    { label: "Status Perkawinan", value: anggota.maritalStatus.replace('_', ' ') },
    { label: "Pekerjaan", value: anggota.occupation },
  ];

  const dataAlamatKontak = [
      { label: "Alamat KTP", value: anggota.addressKtp },
      { label: "Email", value: anggota.email },
  ];

  const dataKeluarga = [
      { label: "Nama Ahli Waris", value: anggota.heirName },
      { label: "Hubungan Ahli Waris", value: anggota.heirRelation },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Detail Calon Anggota</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Bagian Data Pribadi */}
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Data Pribadi</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {dataPribadi.map(item => (
                      <div key={item.label} className="flex flex-col">
                          <dt className="text-gray-500">{item.label}</dt>
                          <dd className="font-medium text-gray-800">{item.value}</dd>
                      </div>
                  ))}
              </dl>
          </div>
          {/* Bagian Alamat & Kontak */}
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Alamat & Kontak</h3>
              <dl className="space-y-2 text-sm">
                   {dataAlamatKontak.map(item => (
                      <div key={item.label} className="flex flex-col">
                          <dt className="text-gray-500">{item.label}</dt>
                          <dd className="font-medium text-gray-800">{item.value}</dd>
                      </div>
                  ))}
              </dl>
          </div>
          {/* Bagian Keluarga */}
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Keluarga (Ahli Waris)</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {dataKeluarga.map(item => (
                      <div key={item.label} className="flex flex-col">
                          <dt className="text-gray-500">{item.label}</dt>
                          <dd className="font-medium text-gray-800">{item.value}</dd>
                      </div>
                  ))}
              </dl>
          </div>
           {/* Bagian Dokumen */}
          <div>
              <h3 className="font-semibold text-brand-red-600 mb-2">Dokumen Terlampir</h3>
              <div className="flex gap-4">
                  <a href={anggota.ktpScanUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <FileText size={16} /> Lihat KTP
                  </a>
                  <a href={anggota.photoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <FileText size={16} /> Lihat Foto Diri
                  </a>
              </div>
          </div>
        </div>
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button>
        </div>
      </div>
    </div>
  );
};


export default function PersetujuanAnggotaPage() {
  const [selectedAnggota, setSelectedAnggota] = useState<CalonAnggota | null>(null);
  const [calonAnggotaList, setCalonAnggotaList] = useState<CalonAnggota[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setCalonAnggotaList(mockCalonAnggota);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (nama: string, action: 'approve' | 'reject') => {
    const message = action === 'approve' 
      ? `Apakah Anda yakin ingin MENYETUJUI pendaftaran "${nama}"?`
      : `Apakah Anda yakin ingin MENOLAK pendaftaran "${nama}"?`;
      
    if (window.confirm(message)) {
      alert(`Simulasi: Pendaftaran "${nama}" telah di-${action === 'approve' ? 'setujui' : 'tolak'}.`);
    }
  };

  // Skeleton kecil
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
  );

  const PersetujuanSkeleton = () => (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                  <th className="p-4 font-medium"><Skeleton className="h-4 w-28" /></th>
                  <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b text-sm">
                    <td className="p-4 font-medium"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
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

  if (loading) {
    return <PersetujuanSkeleton />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Persetujuan Anggota Baru"
        description="Verifikasi dan proses calon anggota yang telah mendaftar."
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <input 
                type="text" 
                placeholder="Cari nama, email, atau pekerjaan..." 
                name="search"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200" 
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-4 font-medium">Nama Lengkap</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Pekerjaan</th>
                  <th className="p-4 font-medium">Tanggal Daftar</th>
                  <th className="p-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {calonAnggotaList.map((calon) => (
                  <tr key={calon.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                    <td className="p-4 font-medium text-gray-800">{calon.fullName}</td>
                    <td className="p-4">{calon.email}</td>
                    <td className="p-4">{calon.occupation}</td>
                    <td className="p-4">{calon.tanggalDaftar}</td>
                    <td className="p-4 text-center space-x-2">
                       {/* Tombol Detail Baru */}
                       <button 
                        onClick={() => setSelectedAnggota(calon)}
                        className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition" 
                        title="Lihat Detail Pendaftar"
                      >
                        <Eye size={20} />
                      </button>

                      <button 
                        onClick={() => handleAction(calon.fullName, 'approve')}
                        className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition" 
                        title="Setujui Pendaftaran"
                      >
                        <CheckCircle size={20} />
                      </button>
                      
                      <button 
                        onClick={() => handleAction(calon.fullName, 'reject')}
                        className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition" 
                        title="Tolak Pendaftaran"
                      >
                        <XCircle size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tampilkan Modal jika ada anggota yang dipilih */}
      {selectedAnggota && <DetailAnggotaModal anggota={selectedAnggota} onClose={() => setSelectedAnggota(null)} />}
    </div>
  );
}