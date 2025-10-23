"use client";

import { useState, useMemo, FormEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Eye, XCircle, Edit, Trash2 } from "lucide-react";

// Tipe Data disesuaikan dengan input tanggal yang baru
type Anggota = {
  no: number;
  namaLengkap: string;
  tempatLahir: string; 
  tanggalLahir: string; 
  jenisKelamin: string;
  pekerjaan: string;
  alamat: string;
  tanggalMasuk: string;
  status: "Aktif" | "Berhenti";
  email?: string;
  tanggalBerhenti?: string;
  alasanBerhenti?: string;
};

// Data contoh disesuaikan
const mockAnggota: Anggota[] = [
  { no: 1, namaLengkap: "Alviansyah Burhani", tempatLahir: "Makassar", tanggalLahir: "1990-05-15", jenisKelamin: "Laki-laki", pekerjaan: "Wiraswasta", alamat: "Jl. Merdeka No. 10, Makassar", tanggalMasuk: "2024-01-15", status: "Aktif", email: "alviansyah.b@example.com" },
  { no: 2, namaLengkap: "Budi Santoso", tempatLahir: "Parepare", tanggalLahir: "1988-02-20", jenisKelamin: "Laki-laki", pekerjaan: "Karyawan Swasta", alamat: "Jl. Veteran No. 15, Makassar", tanggalMasuk: "2024-02-20", status: "Aktif", email: "budi.s@example.com" },
  { no: 3, namaLengkap: "Citra Lestari", tempatLahir: "Gowa", tanggalLahir: "1992-03-05", jenisKelamin: "Perempuan", pekerjaan: "Ibu Rumah Tangga", alamat: "Jl. Dahlia Blok A1/5, Gowa", tanggalMasuk: "2024-03-05", status: "Berhenti", tanggalBerhenti: "2025-08-10", alasanBerhenti: "Pindah domisili", email: "citra.l@example.com" },
];

// ===================================================================
// KOMPONEN MODAL UNTUK TAMBAH ANGGOTA
// ===================================================================
const TambahAnggotaModal = ({ onClose, onAnggotaAdded }: { onClose: () => void; onAnggotaAdded: (anggota: Anggota) => void; }) => {
  
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newAnggota: Anggota = {
      no: Math.floor(Math.random() * 1000),
      namaLengkap: formData.get("namaLengkap") as string,
      tempatLahir: formData.get("tempatLahir") as string,
      tanggalLahir: formData.get("tanggalLahir") as string,
      jenisKelamin: formData.get("jenisKelamin") as string,
      pekerjaan: formData.get("pekerjaan") as string,
      alamat: formData.get("alamat") as string,
      email: formData.get("email") as string,
      tanggalMasuk: new Date().toISOString().split('T')[0],
      status: "Aktif",
    };

    console.log("Data Anggota Baru:", newAnggota);
    alert(`Anggota baru "${newAnggota.namaLengkap}" berhasil ditambahkan (simulasi).`);
    onAnggotaAdded(newAnggota);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Form Pendaftaran Anggota Baru</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label>
              <input type="text" name="namaLengkap" id="namaLengkap" required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label>
              <input type="text" name="tempatLahir" id="tempatLahir" placeholder="Contoh: Makassar" required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label>
                <input type="date" name="tanggalLahir" id="tanggalLahir" required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
                <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label>
                <select name="jenisKelamin" id="jenisKelamin" required className="mt-1 w-full p-2 border rounded-md">
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                </select>
            </div>
          </div>
           <div>
              <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label>
              <input type="text" name="pekerjaan" id="pekerjaan" required className="mt-1 w-full p-2 border rounded-md"/>
            </div>
          <div>
            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label>
            <textarea name="alamat" id="alamat" rows={3} required className="mt-1 w-full p-2 border rounded-md"/>
          </div>
          <div className="border-t pt-4">
             <h3 className="text-base font-semibold text-gray-700 mb-2">Informasi Akun (Opsional)</h3>
             <p className="text-xs text-gray-500 mb-4">Isi email dan password jika anggota ini akan diberikan akses login ke sistem.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" id="password" className="mt-1 w-full p-2 border rounded-md"/>
                </div>
             </div>
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit">Simpan Anggota</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN MODAL UNTUK EDIT ANGGOTA
// ===================================================================
const EditAnggotaModal = ({ anggota, onClose, onAnggotaUpdated }: { anggota: Anggota; onClose: () => void; onAnggotaUpdated: (updatedAnggota: Anggota) => void; }) => {
  const [formData, setFormData] = useState(anggota);

  useEffect(() => {
    setFormData(anggota);
  }, [anggota]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Data Anggota Diperbarui:", formData);
    alert(`Data anggota "${formData.namaLengkap}" berhasil diperbarui (simulasi).`);
    onAnggotaUpdated(formData);
    onClose();
  };

  return (
     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Edit Data Anggota</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label>
              <input type="text" name="namaLengkap" id="namaLengkap" required value={formData.namaLengkap} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">Tempat Lahir*</label>
              <input type="text" name="tempatLahir" id="tempatLahir" required value={formData.tempatLahir} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir*</label>
                <input type="date" name="tanggalLahir" id="tanggalLahir" required value={formData.tanggalLahir} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
                <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label>
                <select name="jenisKelamin" id="jenisKelamin" required value={formData.jenisKelamin} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                </select>
            </div>
          </div>
          <div>
              <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan*</label>
              <input type="text" name="pekerjaan" id="pekerjaan" required value={formData.pekerjaan} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
            </div>
          <div>
            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat Lengkap*</label>
            <textarea name="alamat" id="alamat" rows={3} required value={formData.alamat} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
          </div>
          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl mt-6 -mx-6 -mb-6">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===================================================================
// KOMPONEN MODAL DETAIL ANGGOTA
// ===================================================================
const DetailAnggotaModal = ({ anggota, onClose }: { anggota: Anggota; onClose: () => void; }) => {
  const dataPribadi = [
    { label: "Nama Lengkap", value: anggota.namaLengkap },
    { label: "Tempat, Tanggal Lahir", value: `${anggota.tempatLahir}, ${new Date(anggota.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}` },
    { label: "Jenis Kelamin", value: anggota.jenisKelamin },
    { label: "Pekerjaan", value: anggota.pekerjaan },
    { label: "Alamat", value: anggota.alamat },
  ];
  const dataKeanggotaan = [
    { label: "Tanggal Masuk", value: new Date(anggota.tanggalMasuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })},
    { label: "Status", value: anggota.status },
  ];
   const dataBerhenti = [
    { label: "Tanggal Berhenti", value: anggota.tanggalBerhenti ? new Date(anggota.tanggalBerhenti).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-" },
    { label: "Alasan Berhenti", value: anggota.alasanBerhenti || "-" },
  ];
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
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataPribadi.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl>
          </div>
          <div className="border-b pb-4">
              <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Keanggotaan</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataKeanggotaan.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl>
          </div>
           {anggota.status === 'Berhenti' && (
            <div className="border-b pb-4">
                <h3 className="font-semibold text-brand-red-600 mb-2">Informasi Berhenti</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">{dataBerhenti.map(item => (<div key={item.label}><dt className="text-gray-500">{item.label}</dt><dd className="font-medium text-gray-800 mt-0.5">{item.value}</dd></div>))}</dl>
            </div>
           )}
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
export default function DaftarAnggotaPage() {
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTambahModalOpen, setTambahModalOpen] = useState(false);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>(mockAnggota);
  const [anggotaToEdit, setAnggotaToEdit] = useState<Anggota | null>(null);

  const filteredAnggota = useMemo(() => {
    if (!searchTerm) return anggotaList;
    return anggotaList.filter(anggota =>
      anggota.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, anggotaList]);

  const handleHapus = (nama: string, id: number) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data anggota "${nama}"?`)) {
      setAnggotaList(prev => prev.filter(a => a.no !== id));
      alert(`Anggota "${nama}" telah dihapus (simulasi).`);
    }
  };

  const handleUpdateAnggota = (updatedAnggota: Anggota) => {
    setAnggotaList(prevList => 
      prevList.map(anggota => 
        anggota.no === updatedAnggota.no ? updatedAnggota : anggota
      )
    );
  };

  return (
    <div>
      <AdminPageHeader
        title="Buku Daftar Anggota"
        description="Kelola, tambah, dan cari data anggota koperasi."
        actionButton={
          <Button onClick={() => setTambahModalOpen(true)}>
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
              <div className="flex justify-between border-b border-dotted"><span className="font-semibold text-gray-500">TANGGAL</span><span className="text-gray-800 font-medium">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-sm">
              <input type="text" placeholder="Cari nama anggota..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                {filteredAnggota.map((anggota) => (
                  <tr key={anggota.no} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                    <td className="p-4 font-medium">{anggota.no}.</td>
                    <td className="p-4">{anggota.namaLengkap}</td>
                    <td className="p-4">{anggota.jenisKelamin}</td>
                    <td className="p-4">{anggota.pekerjaan}</td>
                    <td className="p-4">{new Date(anggota.tanggalMasuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${anggota.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {anggota.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => setSelectedAnggota(anggota)} className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition" title="Lihat Detail"><Eye size={20} /></button>
                      <button onClick={() => setAnggotaToEdit(anggota)} className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition" title="Edit Anggota"><Edit size={20} /></button>
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
      {isTambahModalOpen && <TambahAnggotaModal 
        onClose={() => setTambahModalOpen(false)} 
        onAnggotaAdded={(newAnggota) => {
          setAnggotaList(prev => [...prev, newAnggota]);
        }}
      />}
      {anggotaToEdit && <EditAnggotaModal 
        anggota={anggotaToEdit}
        onClose={() => setAnggotaToEdit(null)}
        onAnggotaUpdated={handleUpdateAnggota}
      />}
    </div>
  );
}