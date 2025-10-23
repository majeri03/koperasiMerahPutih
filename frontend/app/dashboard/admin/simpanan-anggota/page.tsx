"use client";

import { useState, useMemo, FormEvent, ChangeEvent } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, Landmark, Gem, CalendarClock, Download, X } from "lucide-react";

// --- Tipe Data ---
type SimpananTransaksi = {
  id: string;
  tanggal: string; // Format YYYY-MM-DD
  anggota: {
    id: string;
    nama: string;
  };
  jenis: 'Pokok' | 'Wajib' | 'Sukarela';
  keterangan: string;
  tipe: 'Setoran' | 'Penarikan';
  jumlah: number;
};

// --- Data Contoh ---
const mockTransaksi: SimpananTransaksi[] = [
  { id: 'trx001', tanggal: '2025-09-15', anggota: { id: 'agt001', nama: 'Alviansyah Burhani' }, jenis: 'Sukarela', tipe: 'Setoran', keterangan: 'Setoran tunai', jumlah: 500000 },
  { id: 'trx002', tanggal: '2025-09-15', anggota: { id: 'agt002', nama: 'Budi Santoso' }, jenis: 'Wajib', tipe: 'Setoran', keterangan: 'Simpanan Wajib September', jumlah: 100000 },
  { id: 'trx003', tanggal: '2025-09-14', anggota: { id: 'agt001', nama: 'Alviansyah Burhani' }, jenis: 'Sukarela', tipe: 'Penarikan', keterangan: 'Penarikan biaya pendidikan', jumlah: 250000 },
  { id: 'trx004', tanggal: '2025-09-12', anggota: { id: 'agt003', nama: 'Citra Lestari' }, jenis: 'Pokok', tipe: 'Setoran', keterangan: 'Simpanan Pokok Awal', jumlah: 1000000 },
  { id: 'trx005', tanggal: '2025-08-30', anggota: { id: 'agt002', nama: 'Budi Santoso' }, jenis: 'Sukarela', tipe: 'Setoran', keterangan: 'Setoran tunai', jumlah: 200000 },
];

const mockTotalSimpanan = {
    pokok: 152000000,
    wajib: 488750000,
    sukarela: 210000000
};

type NewTransaksiData = {
  anggotaId: string;
  jenis: 'Pokok' | 'Wajib' | 'Sukarela';
  jumlah: number;
  tanggal: string;
  keterangan: string;
};

// ===================================================================
// KOMPONEN MODAL UNTUK TRANSAKSI
// ===================================================================
const TransaksiSimpananModal = ({
    isOpen,
    onClose,
    onSave,
    tipe
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NewTransaksiData, tipe: 'Setoran' | 'Penarikan') => void;
    tipe: 'Setoran' | 'Penarikan' | null;
}) => {
    const [formData, setFormData] = useState<NewTransaksiData>({
        anggotaId: '',
        jenis: tipe === 'Penarikan' ? 'Sukarela' : 'Wajib', // Default berbeda untuk penarikan
        jumlah: 0,
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!tipe) return;
        onSave(formData, tipe);
        onClose();
    };

    if (!isOpen || !tipe) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Catat {tipe} Simpanan</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="anggotaId" className="block text-sm font-medium text-gray-700">Anggota*</label>
                            <input type="text" id="anggotaId" name="anggotaId" required placeholder="Cari nama atau ID anggota..." value={formData.anggotaId} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="jenis" className="block text-sm font-medium text-gray-700">Jenis Simpanan*</label>
                                <select id="jenis" name="jenis" required value={formData.jenis} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg bg-white">
                                    {tipe === 'Setoran' && <option value="Pokok">Pokok</option>}
                                    {tipe === 'Setoran' && <option value="Wajib">Wajib</option>}
                                    <option value="Sukarela">Sukarela</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">Jumlah (Rp)*</label>
                                <input type="number" id="jumlah" name="jumlah" required min="1" value={formData.jumlah} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal Transaksi*</label>
                            <input type="date" id="tanggal" name="tanggal" required value={formData.tanggal} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700">Keterangan</label>
                            <textarea id="keterangan" name="keterangan" rows={2} value={formData.keterangan} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit">Simpan Transaksi</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function SimpananAnggotaPage() {
    const [filters, setFilters] = useState({ search: '', tipe: '', jenis: '', tanggalMulai: '', tanggalSelesai: '' });
    const [transaksiList, setTransaksiList] = useState<SimpananTransaksi[]>(mockTransaksi);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Setoran' | 'Penarikan' | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ search: '', tipe: '', jenis: '', tanggalMulai: '', tanggalSelesai: '' });
    };

    const filteredTransaksi = useMemo(() => {
        return transaksiList.filter(trx => {
            const tanggalTrx = new Date(trx.tanggal);
            const tanggalMulai = filters.tanggalMulai ? new Date(filters.tanggalMulai) : null;
            const tanggalSelesai = filters.tanggalSelesai ? new Date(filters.tanggalSelesai) : null;
            if (tanggalMulai) tanggalMulai.setHours(0, 0, 0, 0);
            if (tanggalSelesai) tanggalSelesai.setHours(23, 59, 59, 999);
            return (
                trx.anggota.nama.toLowerCase().includes(filters.search.toLowerCase()) &&
                (filters.tipe === '' || trx.tipe === filters.tipe) &&
                (filters.jenis === '' || trx.jenis === filters.jenis) &&
                (!tanggalMulai || tanggalTrx >= tanggalMulai) &&
                (!tanggalSelesai || tanggalTrx <= tanggalSelesai)
            );
        });
    }, [filters, transaksiList]);
    
    const handleOpenModal = (tipe: 'Setoran' | 'Penarikan') => {
        setModalType(tipe);
        setIsModalOpen(true);
    };
    
    const handleSaveTransaksi = (data: NewTransaksiData, tipe: 'Setoran' | 'Penarikan') => {
        const newTransaksi: SimpananTransaksi = {
            id: `trx${Math.floor(Math.random() * 10000)}`,
            tanggal: data.tanggal,
            anggota: { id: data.anggotaId, nama: data.anggotaId }, // Simulasikan nama = id
            jenis: data.jenis,
            keterangan: data.keterangan,
            tipe: tipe,
            jumlah: Number(data.jumlah)
        };
        setTransaksiList(prev => [newTransaksi, ...prev]);
        alert(`Simulasi: ${tipe} untuk anggota ${data.anggotaId} sejumlah Rp ${Number(data.jumlah).toLocaleString('id-ID')} berhasil disimpan.`);
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        if (format === 'pdf') {
            // Panggil nama fungsi yang benar dari exportUtils
            const { generateSimpananPdf } = await import('@/lib/exportUtils');
            generateSimpananPdf(filteredTransaksi);
        } else if (format === 'excel') {
            // Panggil nama fungsi yang benar dari exportUtils
            const { generateSimpananExcel } = await import('@/lib/exportUtils');
            generateSimpananExcel(filteredTransaksi);
        }
    };
    
    return (
        <div>
            <AdminPageHeader
                title="Buku Simpanan Anggota"
                description="Kelola semua transaksi simpanan pokok, wajib, dan sukarela anggota."
                actionButton={
                    <div className="flex gap-2">
                        <Button onClick={() => handleOpenModal('Setoran')} variant="primary">
                            <PlusCircle size={20} /><span>Catat Setoran</span>
                        </Button>
                        <Button onClick={() => handleOpenModal('Penarikan')} variant="outline">
                            <PlusCircle size={20} /><span>Catat Penarikan</span>
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"><div className="flex items-center gap-3"><div className="p-3 bg-blue-100 rounded-full"><Landmark className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Simpanan Pokok</p><p className="text-xl font-bold text-gray-800">Rp {mockTotalSimpanan.pokok.toLocaleString('id-ID')}</p></div></div></div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"><div className="flex items-center gap-3"><div className="p-3 bg-green-100 rounded-full"><CalendarClock className="h-6 w-6 text-green-600" /></div><div><p className="text-sm text-gray-500">Total Simpanan Wajib</p><p className="text-xl font-bold text-gray-800">Rp {mockTotalSimpanan.wajib.toLocaleString('id-ID')}</p></div></div></div>
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100"><div className="flex items-center gap-3"><div className="p-3 bg-purple-100 rounded-full"><Gem className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm text-gray-500">Total Simpanan Sukarela</p><p className="text-xl font-bold text-gray-800">Rp {mockTotalSimpanan.sukarela.toLocaleString('id-ID')}</p></div></div></div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-700">Riwayat Transaksi</h2>
                        <div className="relative">
                            <Button variant="outline" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
                                <Download size={18}/> <span>Ekspor</span>
                            </Button>
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                                    <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Unduh Laporan (PDF)</button>
                                    <button onClick={() => handleExport('excel')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Unduh Laporan (Excel)</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="lg:col-span-2"><label htmlFor="search" className="block text-sm font-medium text-gray-600 mb-1">Cari Anggota</label><div className="relative"><input id="search" name="search" type="text" placeholder="Nama anggota..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 border rounded-lg" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /></div></div>
                        <div><label htmlFor="tipe" className="block text-sm font-medium text-gray-600 mb-1">Tipe Transaksi</label><select id="tipe" name="tipe" value={filters.tipe} onChange={handleFilterChange} className="w-full p-2 border rounded-lg"><option value="">Semua</option><option value="Setoran">Setoran</option><option value="Penarikan">Penarikan</option></select></div>
                        <div><label htmlFor="jenis" className="block text-sm font-medium text-gray-600 mb-1">Jenis Simpanan</label><select id="jenis" name="jenis" value={filters.jenis} onChange={handleFilterChange} className="w-full p-2 border rounded-lg"><option value="">Semua</option><option value="Pokok">Pokok</option><option value="Wajib">Wajib</option><option value="Sukarela">Sukarela</option></select></div>
                        <div><Button onClick={resetFilters} variant="outline" className="w-full"><X size={16} /> Reset Filter</Button></div>
                        <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium text-gray-600 mb-1">Rentang Tanggal</label><div className="flex items-center gap-2"><input name="tanggalMulai" type="date" value={filters.tanggalMulai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" /><span className="text-gray-500">s/d</span><input name="tanggalSelesai" type="date" value={filters.tanggalSelesai} onChange={handleFilterChange} className="w-full p-2 border rounded-lg" /></div></div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b bg-gray-50 text-sm text-gray-600">
                                <tr>
                                    <th className="p-4 font-medium">Tanggal</th>
                                    <th className="p-4 font-medium">Anggota</th>
                                    <th className="p-4 font-medium">Jenis Simpanan</th>
                                    <th className="p-4 font-medium">Keterangan</th>
                                    <th className="p-4 font-medium text-right">Jumlah (Rp)</th>
                                    <th className="p-4 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransaksi.length > 0 ? (
                                    filteredTransaksi.map((trx) => (
                                        <tr key={trx.id} className="border-b hover:bg-red-300 text-sm transition-colors duration-150">
                                            <td className="p-4">{new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="p-4 font-medium text-gray-800">{trx.anggota.nama}</td>
                                            <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${trx.jenis === 'Pokok' ? 'bg-blue-100 text-blue-700' : trx.jenis === 'Wajib' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{trx.jenis}</span></td>
                                            <td className="p-4 text-gray-600">{trx.keterangan}</td>
                                            <td className={`p-4 text-right font-semibold ${trx.tipe === 'Setoran' ? 'text-green-600' : 'text-red-600'}`}>{trx.tipe === 'Penarikan' ? '-' : ''}{trx.jumlah.toLocaleString('id-ID')}</td>
                                            <td className="p-4 text-center"><button className="text-blue-600 hover:underline text-xs font-medium">Lihat Detail</button></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="text-center p-8 text-gray-500">Tidak ada transaksi yang sesuai dengan filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TransaksiSimpananModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaksi}
                tipe={modalType}
            />
        </div>
    );
}