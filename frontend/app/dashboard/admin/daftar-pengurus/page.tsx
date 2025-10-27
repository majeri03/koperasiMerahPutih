"use client";

import { useState, useMemo, FormEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Eye, Trash2, XCircle } from "lucide-react";
import clsx from "clsx";

// Tipe Data disesuaikan dengan semua kolom di file Excel "Buku Daftar Pengurus"
type Pengurus = {
  no: number;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  pekerjaan: string;
  alamat: string;
  nomorKeanggotaan: string;
  jabatan: string;
  tanggalDiangkat: string; // Format YYYY-MM-DD
  tanggalBerhenti: string | null; // Format YYYY-MM-DD atau null
  alasanBerhenti?: string;
};

// Data contoh disesuaikan dengan tipe baru
const mockPengurus: Pengurus[] = [
  { no: 1, namaLengkap: "Andi Wijaya", tempatLahir: "Makassar", tanggalLahir: "1985-01-20", jenisKelamin: "Laki-laki", pekerjaan: "Manajer", alamat: "Jl. Sudirman No.1", nomorKeanggotaan: "AGT-001", jabatan: "Ketua", tanggalDiangkat: "2024-01-10", tanggalBerhenti: null },
  { no: 2, namaLengkap: "Siti Aminah", tempatLahir: "Bandung", tanggalLahir: "1988-03-15", jenisKelamin: "Perempuan", pekerjaan: "Akuntan", alamat: "Jl. Asia Afrika No. 10", nomorKeanggotaan: "AGT-002", jabatan: "Sekretaris", tanggalDiangkat: "2024-01-10", tanggalBerhenti: null },
  { no: 3, namaLengkap: "Bambang Susilo", tempatLahir: "Surabaya", tanggalLahir: "1982-07-22", jenisKelamin: "Laki-laki", pekerjaan: "Auditor", alamat: "Jl. Darmo No. 50", nomorKeanggotaan: "AGT-003", jabatan: "Bendahara", tanggalDiangkat: "2024-01-10", tanggalBerhenti: null },
  { no: 4, namaLengkap: "Dewi Lestari", tempatLahir: "Jakarta", tanggalLahir: "1980-11-30", jenisKelamin: "Perempuan", pekerjaan: "Pengusaha", alamat: "Jl. Thamrin No. 100", nomorKeanggotaan: "AGT-004", jabatan: "Ketua", tanggalDiangkat: "2019-01-05", tanggalBerhenti: "2024-01-09", alasanBerhenti: "Masa Jabatan Selesai" },
];

// ===================================================================
// KOMPONEN MODAL UNTUK TAMBAH PENGURUS
// ===================================================================
const TambahPengurusModal = ({ onClose, onPengurusAdded }: { onClose: () => void; onPengurusAdded: (pengurus: Pengurus) => void; }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPengurus: Pengurus = {
      no: Math.floor(Math.random() * 1000),
      namaLengkap: formData.get("namaLengkap") as string,
      tempatLahir: formData.get("tempatLahir") as string,
      tanggalLahir: formData.get("tanggalLahir") as string,
      jenisKelamin: formData.get("jenisKelamin") as string,
      pekerjaan: formData.get("pekerjaan") as string,
      alamat: formData.get("alamat") as string,
      nomorKeanggotaan: formData.get("nomorKeanggotaan") as string,
      jabatan: formData.get("jabatan") as string,
      tanggalDiangkat: formData.get("tanggalDiangkat") as string,
      tanggalBerhenti: null,
    };
    alert(`Pengurus baru "${newPengurus.namaLengkap}" berhasil ditambahkan.`);
    onPengurusAdded(newPengurus);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Form Tambah Pengurus Baru</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label><input type="text" name="namaLengkap" id="namaLengkap" required className="mt-1 w-full p-2 border rounded-md"/></div>
            <div><label htmlFor="nomorKeanggotaan" className="block text-sm font-medium text-gray-700">Nomor Keanggotaan*</label><input type="text" name="nomorKeanggotaan" id="nomorKeanggotaan" required className="mt-1 w-full p-2 border rounded-md"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label><input type="text" name="tempatLahir" id="tempatLahir" required className="mt-1 w-full p-2 border rounded-md"/></div>
            <div><label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label><input type="date" name="tanggalLahir" id="tanggalLahir" required className="mt-1 w-full p-2 border rounded-md"/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label><select name="jenisKelamin" id="jenisKelamin" required className="mt-1 w-full p-2 border rounded-md"><option value="">Pilih...</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
            <div><label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label><input type="text" name="pekerjaan" id="pekerjaan" required className="mt-1 w-full p-2 border rounded-md"/></div>
          </div>
          <div><label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label><textarea name="alamat" id="alamat" rows={2} required className="mt-1 w-full p-2 border rounded-md"/></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div><label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan Pengurus*</label><input type="text" name="jabatan" id="jabatan" placeholder="Contoh: Ketua" required className="mt-1 w-full p-2 border rounded-md"/></div>
            <div><label htmlFor="tanggalDiangkat" className="block text-sm font-medium text-gray-700">Tanggal Diangkat*</label><input type="date" name="tanggalDiangkat" id="tanggalDiangkat" required className="mt-1 w-full p-2 border rounded-md"/></div>
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit">Simpan Pengurus</Button>
          </div>
        </form>
      </div>
    </div>
  );
};



// ===================================================================
// KOMPONEN MODAL UNTUK DETAIL PENGURUS
// ===================================================================
const DetailPengurusModal = ({ pengurus, onClose }: { pengurus: Pengurus; onClose: () => void; }) => {
    const dataPribadi = [
        { label: "Nama Lengkap", value: pengurus.namaLengkap },
        { label: "Nomor Keanggotaan", value: pengurus.nomorKeanggotaan },
        { label: "Tempat, Tanggal Lahir", value: `${pengurus.tempatLahir}, ${new Date(pengurus.tanggalLahir).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}` },
        { label: "Jenis Kelamin", value: pengurus.jenisKelamin },
        { label: "Pekerjaan", value: pengurus.pekerjaan },
        { label: "Alamat", value: pengurus.alamat },
    ];
    const dataJabatan = [
        { label: "Jabatan", value: pengurus.jabatan },
        { label: "Tanggal Diangkat", value: new Date(pengurus.tanggalDiangkat).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) },
        { label: "Tanggal Berhenti", value: pengurus.tanggalBerhenti ? new Date(pengurus.tanggalBerhenti).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'}) : "Masih Aktif" },
        { label: "Alasan Berhenti", value: pengurus.alasanBerhenti || "-" },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Detail Pengurus</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
                <div className="border-b pb-4"><h3 className="font-semibold text-brand-red-600 mb-2">Data Pribadi</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataPribadi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl></div>
                <div className="border-b pb-4"><h3 className="font-semibold text-brand-red-600 mb-2">Informasi Jabatan</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataJabatan.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl></div>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
               <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Tutup</button>
            </div>
          </div>
        </div>
    );
};


// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function DaftarPengurusPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [pengurusList, setPengurusList] = useState<Pengurus[]>([]);
    const [isTambahModalOpen, setTambahModalOpen] = useState(false);
    const [pengurusToView, setPengurusToView] = useState<Pengurus | null>(null); // State untuk detail
    const [loading, setLoading] = useState(true);

    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => {
            setPengurusList(mockPengurus);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredPengurus = useMemo(() => {
        if (!searchTerm) return pengurusList;
        return pengurusList.filter(p => p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, pengurusList]);

    const handleHapus = (nama: string, id: number) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus data pengurus "${nama}"?`)) {
            setPengurusList(prev => prev.filter(p => p.no !== id));
            alert(`Pengurus "${nama}" telah dihapus (simulasi).`);
        }
    };
    


    // Skeleton kecil
    const Skeleton = ({ className = "" }: { className?: string }) => (
        <div className={clsx("animate-pulse bg-gray-200 rounded-md", className)} />
    );

    const DaftarPengurusSkeleton = () => (
        <div>
            <div className="mb-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <Skeleton className="h-6 w-1/2 mx-auto text-center" />
                    <div className="mt-6 max-w-4xl mx-auto grid grid-cols-2 gap-x-12 text-sm">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-full max-w-sm">
                            <Skeleton className="w-full h-10 rounded-lg" />
                        </div>
                        <Skeleton className="h-10 w-40 ml-4" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-12" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-32" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4 font-medium"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                    <th className="p-4 font-medium text-center"><Skeleton className="h-4 w-16 mx-auto" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b text-sm">
                                        <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                                        <td className="p-4 text-center"><Skeleton className="h-8 w-24 mx-auto" /></td>
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
        return <DaftarPengurusSkeleton />;
    }

    return (
        <div>
            <div className="mb-6">
                <AdminPageHeader
                    title="Manajemen Pengurus"
                    description="Kelola data pengurus koperasi sesuai buku daftar pengurus."
                    actionButton={<Button onClick={() => setTambahModalOpen(true)}><PlusCircle size={20} /><span>Tambah Pengurus</span></Button>}
                />
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-center uppercase tracking-wider text-gray-700">Buku Daftar Pengurus</h2>
                    {/* ... (kode kop surat) ... */}
                </div>
                
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-full max-w-sm">
                            <input type="text" placeholder="Cari pengurus..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">No.</th>
                                    <th className="p-4 font-medium">Nama Lengkap</th>
                                    <th className="p-4 font-medium">No. Anggota</th>
                                    <th className="p-4 font-medium">Jabatan</th>
                                    <th className="p-4 font-medium">Tanggal Diangkat</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPengurus.map((pengurus) => (
                                    <tr key={pengurus.no} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                        <td className="p-4 font-medium">{pengurus.no}.</td>
                                        <td className="p-4">{pengurus.namaLengkap}</td>
                                        <td className="p-4">{pengurus.nomorKeanggotaan}</td>
                                        <td className="p-4">{pengurus.jabatan}</td>
                                        <td className="p-4">{new Date(pengurus.tanggalDiangkat).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${!pengurus.tanggalBerhenti ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {!pengurus.tanggalBerhenti ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <button onClick={() => setPengurusToView(pengurus)} className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200" title="Lihat Detail"><Eye size={20} /></button>

                                            {pengurus.tanggalBerhenti && <button onClick={() => handleHapus(pengurus.namaLengkap, pengurus.no)} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200" title="Hapus Data"><Trash2 size={20} /></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {isTambahModalOpen && <TambahPengurusModal onClose={() => setTambahModalOpen(false)} onPengurusAdded={(newPengurus) => setPengurusList(prev => [...prev, newPengurus])} />}
            {pengurusToView && <DetailPengurusModal pengurus={pengurusToView} onClose={() => setPengurusToView(null)} />}
        </div>
    );
}