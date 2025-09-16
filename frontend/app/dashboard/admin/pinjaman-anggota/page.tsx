// Lokasi: frontend/app/dashboard/admin/pinjaman-anggota/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, HandCoins, CheckCircle, Clock, Download, X, Send } from "lucide-react";

// --- Tipe Data ---
type Pinjaman = {
  id: string;
  tanggalPinjam: string;
  anggota: {
    id: string;
    nama: string;
  };
  jumlahPinjaman: number;
  jangkaWaktu: number; // dalam bulan
  bunga: number; // dalam persen
  status: 'Aktif' | 'Lunas';
  tanggalLunas: string | null;
};

// --- Data Contoh ---
const mockPinjaman: Pinjaman[] = [
  { id: 'pinj001', tanggalPinjam: '2025-08-01', anggota: { id: 'agt001', nama: 'Alviansyah Burhani' }, jumlahPinjaman: 5000000, jangkaWaktu: 12, bunga: 1.5, status: 'Aktif', tanggalLunas: null },
  { id: 'pinj002', tanggalPinjam: '2025-07-15', anggota: { id: 'agt002', nama: 'Budi Santoso' }, jumlahPinjaman: 2000000, jangkaWaktu: 6, bunga: 1.5, status: 'Aktif', tanggalLunas: null },
  { id: 'pinj003', tanggalPinjam: '2025-02-10', anggota: { id: 'agt003', nama: 'Citra Lestari' }, jumlahPinjaman: 3000000, jangkaWaktu: 10, bunga: 1.5, status: 'Lunas', tanggalLunas: '2025-08-10' },
  { id: 'pinj004', tanggalPinjam: '2025-09-05', anggota: { id: 'agt002', nama: 'Budi Santoso' }, jumlahPinjaman: 1500000, jangkaWaktu: 12, bunga: 1.5, status: 'Aktif', tanggalLunas: null },
];

const mockTotalPinjaman = {
    beredar: 8500000,
    lunasBulanIni: 1,
    akanJatuhTempo: 2,
};

// --- Tipe untuk data formulir Pinjaman ---
type NewPinjamanData = {
    anggotaId: string;
    jumlahPinjaman: number;
    jangkaWaktu: number; // bulan
    bunga: number; // persen
    tanggalPinjam: string;
};

// --- KOMPONEN MODAL CATAT PINJAMAN BARU ---
const CatatPinjamanModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: NewPinjamanData) => void; }) => {
    const [formData, setFormData] = useState<NewPinjamanData>({
        anggotaId: '',
        jumlahPinjaman: 0,
        jangkaWaktu: 12,
        bunga: 1.5,
        tanggalPinjam: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Catat Pinjaman Baru</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="anggotaId" className="block text-sm font-medium text-gray-700">Anggota</label>
                            <input type="text" id="anggotaId" name="anggotaId" required placeholder="Cari nama atau ID anggota..." value={formData.anggotaId} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="jumlahPinjaman" className="block text-sm font-medium text-gray-700">Jumlah Pinjaman (Rp)</label>
                                <input type="number" id="jumlahPinjaman" name="jumlahPinjaman" required value={formData.jumlahPinjaman} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="jangkaWaktu" className="block text-sm font-medium text-gray-700">Jangka Waktu (Bulan)</label>
                                <input type="number" id="jangkaWaktu" name="jangkaWaktu" required value={formData.jangkaWaktu} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="tanggalPinjam" className="block text-sm font-medium text-gray-700">Tanggal Pinjam</label>
                            <input type="date" id="tanggalPinjam" name="tanggalPinjam" required value={formData.tanggalPinjam} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">Simpan Pinjaman</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function PinjamanAnggotaPage() {
    const [filters, setFilters] = useState({ search: '', status: '', tanggalMulai: '', tanggalSelesai: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ search: '', status: '', tanggalMulai: '', tanggalSelesai: '' });
    };

    const filteredPinjaman = useMemo(() => {
        return mockPinjaman.filter(pinjaman => {
            const tanggalPinjam = new Date(pinjaman.tanggalPinjam);
            const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
            const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;
            if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
            if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);
            return (
                pinjaman.anggota.nama.toLowerCase().includes(filters.search.toLowerCase()) &&
                (filters.status === '' || pinjaman.status === filters.status) &&
                (!tanggalMulai || tanggalPinjam >= tanggalMulai) &&
                (!tanggalSelesai || tanggalPinjam <= tanggalSelesai)
            );
        });
    }, [filters]);
    
    const handleNotifikasiMassal = () => {
        const pinjamanAktifCount = mockPinjaman.filter(p => p.status === 'Aktif').length;
        if (window.confirm(`Anda akan mengirim notifikasi jatuh tempo ke ${pinjamanAktifCount} anggota. Lanjutkan?`)) {
            alert("Simulasi: Notifikasi massal berhasil dikirim.");
        }
    };
    
    const handleNotifikasiIndividual = (nama: string) => {
        alert(`Simulasi: Notifikasi jatuh tempo berhasil dikirim ke anggota "${nama}".`);
    };

    const handleSavePinjaman = (data: NewPinjamanData) => {
        console.log("Data Pinjaman Baru:", data);
        alert(`Simulasi: Pinjaman baru untuk ${data.anggotaId} berhasil disimpan.`);
    };

    return (
        <div>
            <AdminPageHeader
                title="Buku Pinjaman Anggota"
                description="Kelola semua data pinjaman yang diberikan kepada anggota."
                actionButton={
                    <div className="flex flex-wrap gap-2">
                         <Button onClick={handleNotifikasiMassal} variant="outline">
                            <Send size={18} /><span>Kirim Notifikasi</span>
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)} variant="primary">
                            <PlusCircle size={20} /><span>Catat Pinjaman Baru</span>
                        </Button>
                    </div>
                }
            />

            {/* --- KARTU RINGKASAN (KODE DIKEMBALIKAN) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full"><HandCoins className="h-6 w-6 text-red-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Total Pinjaman Beredar</p>
                            <p className="text-xl font-bold text-gray-800">Rp {mockTotalPinjaman.beredar.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Lunas Bulan Ini</p>
                            <p className="text-xl font-bold text-gray-800">{mockTotalPinjaman.lunasBulanIni} Pinjaman</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full"><Clock className="h-6 w-6 text-yellow-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Akan Jatuh Tempo</p>
                            <p className="text-xl font-bold text-gray-800">{mockTotalPinjaman.akanJatuhTempo} Pinjaman</p>
                        </div>
                    </div>
                </div>
            </div>
      
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    {/* --- AREA FILTER & TABEL (KODE DIKEMBALIKAN) --- */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anggota</label>
                            <div className="relative">
                                <input id="search" name="search" type="text" placeholder="Nama anggota..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-600 mb-1">Status Pinjaman</label>
                            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-lg">
                                <option value="">Semua</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Lunas">Lunas</option>
                            </select>
                        </div>
                        <div>
                            <Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Rentang Tanggal Pinjam</label>
                            <div className="flex items-center gap-2">
                                <input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                                <span className="text-gray-500">s/d</span>
                                <input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Anggota</th>
                                    <th className="p-4 font-medium text-right">Jumlah Pinjaman</th>
                                    <th className="p-4 font-medium text-center">Jangka Waktu</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPinjaman.map((pinjaman) => (
                                    <tr key={pinjaman.id} className="border-b hover:bg-gray-50 text-sm">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800">{pinjaman.anggota.nama}</div>
                                            <div className="text-xs text-gray-500">Tgl Pinjam: {new Date(pinjaman.tanggalPinjam).toLocaleDateString('id-ID')}</div>
                                        </td>
                                        <td className="p-4 text-right font-semibold">Rp {pinjaman.jumlahPinjaman.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center">{pinjaman.jangkaWaktu} bulan</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${pinjaman.status === 'Aktif' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {pinjaman.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <button className="text-blue-600 hover:underline text-xs font-medium">Lihat Angsuran</button>
                                            <button 
                                                onClick={() => handleNotifikasiIndividual(pinjaman.anggota.nama)}
                                                disabled={pinjaman.status === 'Lunas'}
                                                className="text-gray-500 hover:text-gray-800 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={pinjaman.status === 'Lunas' ? 'Pinjaman sudah lunas' : 'Kirim notifikasi jatuh tempo'}
                                            >
                                                <Send size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CatatPinjamanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePinjaman}
            />
        </div>
    );
}