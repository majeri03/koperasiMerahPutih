"use client";

// 1. Impor `useState` dan `useMemo` dari React
import { useState, useMemo } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Eye, FileText, XCircle, Edit, Trash2 } from "lucide-react";

// Tipe Data tidak berubah
type Anggota = {
  no: number;
  namaLengkap: string;
  jenisKelamin: string;
  pekerjaan: string;
  tanggalMasuk: string;
  status: "Aktif" | "Berhenti";
  nik?: string;
  email?: string;
  ttl?: string;
};

// Data Contoh tidak berubah
const mockAnggota: Anggota[] = [
  { no: 1, namaLengkap: "Alviansyah Burhani", jenisKelamin: "Laki-laki", pekerjaan: "Wiraswasta", tanggalMasuk: "15 Januari 2024", status: "Aktif", nik: "7371011505900001", email: "alviansyah.b@example.com", ttl: "Makassar, 15 Mei 1990" },
  { no: 2, namaLengkap: "Budi Santoso", jenisKelamin: "Laki-laki", pekerjaan: "Karyawan Swasta", tanggalMasuk: "20 Februari 2024", status: "Aktif", nik: "7371012002880002", email: "budi.s@example.com", ttl: "Parepare, 20 Februari 1988" },
  { no: 3, namaLengkap: "Citra Lestari", jenisKelamin: "Perempuan", pekerjaan: "Ibu Rumah Tangga", tanggalMasuk: "05 Maret 2024", status: "Berhenti", nik: "7371020503920003", email: "citra.l@example.com", ttl: "Gowa, 05 Maret 1992" },
];

// Komponen Modal Detail tidak berubah
const DetailAnggotaModal = ({ anggota, onClose }: { anggota: Anggota; onClose: () => void; }) => {
  const dataPribadi = [ { label: "NIK", value: anggota.nik || "-" }, { label: "Tempat, Tanggal Lahir", value: anggota.ttl || "-" }, { label: "Jenis Kelamin", value: anggota.jenisKelamin }, { label: "Pekerjaan", value: anggota.pekerjaan } ];
  const dataKeanggotaan = [ { label: "Tanggal Masuk", value: anggota.tanggalMasuk }, { label: "Status", value: anggota.status }, { label: "Email", value: anggota.email || "-" } ];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Detail Anggota</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Data Pribadi</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">{dataPribadi.map(item => (<div key={item.label} className="flex flex-col"><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800">{item.value}</dd></div>))}</dl>
          </div>
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Keanggotaan</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">{dataKeanggotaan.map(item => (<div key={item.label} className="flex flex-col"><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800">{item.value}</dd></div>))}</dl>
          </div>
        </div>
        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button>
        </div>
      </div>
    </div>
  );
};


export default function DaftarAnggotaPage() {
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);
  
  // 2. State untuk menyimpan kata kunci pencarian
  const [searchTerm, setSearchTerm] = useState("");

  // 3. Logika untuk memfilter anggota berdasarkan searchTerm
  const filteredAnggota = useMemo(() => {
    if (!searchTerm) {
      return mockAnggota; // Jika tidak ada pencarian, tampilkan semua
    }
    return mockAnggota.filter(anggota =>
      anggota.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, mockAnggota]);


  const handleHapus = (nama: string, id: number) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data anggota "${nama}"?`)) {
      console.log(`Menghapus anggota dengan ID: ${id}`);
      alert(`Anggota "${nama}" telah dihapus (simulasi).`);
    }
  };

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
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">Buku Daftar Anggota</h2>
          <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KOPERASI</span><span className="text-gray-800 font-medium">MERAH PUTIH JAYA</span></div>
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">KAB / KOTA</span><span className="text-gray-800 font-medium">KOTA MAKASSAR</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">NO. BADAN HUKUM</span><span className="text-gray-800 font-medium">123/BH/IV.2/IX/2025</span></div>
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL</span><span className="text-gray-800 font-medium">16 September 2025</span></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              {/* 4. Hubungkan input dengan state dan event handler */}
              <input
                type="text"
                placeholder="Cari anggota..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {/* 5. Gunakan data yang sudah difilter di sini */}
                {filteredAnggota.map((anggota) => (
                  <tr key={anggota.no} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-4 font-medium">{anggota.no}.</td>
                    <td className="p-4">{anggota.namaLengkap}</td>
                    <td className="p-4">{anggota.jenisKelamin}</td>
                    <td className="p-4">{anggota.pekerjaan}</td>
                    <td className="p-4">{anggota.tanggalMasuk}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${anggota.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {anggota.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => setSelectedAnggota(anggota)} className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition" title="Lihat Detail"><Eye size={20} /></button>
                      <button className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition" title="Edit Anggota"><Edit size={20} /></button>
                      {anggota.status === 'Berhenti' && (<button onClick={() => handleHapus(anggota.namaLengkap, anggota.no)} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition" title="Hapus Data"><Trash2 size={20} /></button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {selectedAnggota && <DetailAnggotaModal anggota={selectedAnggota} onClose={() => setSelectedAnggota(null)} />}
    </div>
  );
}