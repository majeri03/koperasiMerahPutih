// Lokasi: frontend/app/dashboard/admin/pinjaman-anggota/page.tsx
"use client";

import { useState, useMemo, FormEvent, ChangeEvent, useEffect } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { PlusCircle, Search, HandCoins, CheckCircle, Clock, X, Send, ChevronDown, MoreHorizontal, CheckCircle2, Hourglass } from "lucide-react";

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
    noBukti?: string;
    pekerjaan?: string;
    keperluan?: string;
    jaminan?: string;
};

// --- Data Contoh ---
const mockPinjaman: Pinjaman[] = [
    { id: 'pinj001', noBukti: 'PJ-12345', tanggalPinjam: '2025-08-01', anggota: { id: 'agt001', nama: 'Alviansyah Burhani' }, pekerjaan: 'Wiraswasta', jumlahPinjaman: 5000000, jangkaWaktu: 12, bunga: 1.5, status: 'Aktif', tanggalLunas: null, keperluan: 'Modal Usaha', jaminan: 'BPKB Motor' },
    { id: 'pinj002', noBukti: 'PJ-12346', tanggalPinjam: '2025-07-15', anggota: { id: 'agt002', nama: 'Budi Santoso' }, pekerjaan: 'Karyawan Swasta', jumlahPinjaman: 2000000, jangkaWaktu: 6, bunga: 1.5, status: 'Aktif', tanggalLunas: null, keperluan: 'Biaya Sekolah Anak', jaminan: '-' },
    { id: 'pinj003', noBukti: 'PJ-12347', tanggalPinjam: '2025-02-10', anggota: { id: 'agt003', nama: 'Citra Lestari' }, pekerjaan: 'PNS', jumlahPinjaman: 3000000, jangkaWaktu: 10, bunga: 1.5, status: 'Lunas', tanggalLunas: '2025-08-10', keperluan: 'Renovasi Rumah', jaminan: 'Sertifikat Rumah' },
    { id: 'pinj004', noBukti: 'PJ-12348', tanggalPinjam: '2025-09-05', anggota: { id: 'agt002', nama: 'Budi Santoso' }, pekerjaan: 'Karyawan Swasta', jumlahPinjaman: 1500000, jangkaWaktu: 12, bunga: 1.5, status: 'Aktif', tanggalLunas: null, keperluan: 'Pembelian Elektronik', jaminan: '-' },
];

const mockTotalPinjaman = {
    beredar: 8500000,
    lunasBulanIni: 1,
    akanJatuhTempo: 2,
};

// --- DATABASE ANGGOTA (SIMULASI) ---
const mockAnggotaDB = [
    { id: 'agt001', nama: 'Alviansyah Burhani', pekerjaan: 'Wiraswasta' },
    { id: 'agt002', nama: 'Budi Santoso', pekerjaan: 'Karyawan Swasta' },
    { id: 'agt003', nama: 'Citra Lestari', pekerjaan: 'PNS' },
    { id: 'agt004', nama: 'Dewi Anggraini', pekerjaan: 'Dokter' },
    { id: 'agt005', nama: 'Eko Prasetyo', pekerjaan: 'Guru' },
];

// --- Tipe untuk data formulir Pinjaman ---
type NewPinjamanData = {
    noBukti: string;
    anggotaId: string;
    pekerjaan: string;
    jumlahPinjaman: number;
    jangkaWaktu: number;
    bunga: number;
    tanggalPinjam: string;
    keperluan: string;
    jaminan: string;
};

// ===================================================================
// KOMPONEN MODAL CATAT PINJAMAN BARU
// ===================================================================
// Tipe untuk state formData, mengizinkan string kosong untuk angka
type FormDataState = Omit<NewPinjamanData, 'anggotaId' | 'pekerjaan'> & {
    jumlahPinjaman: number | '';
    jangkaWaktu: number | '';
    bunga: number | '';
};

const CatatPinjamanModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: NewPinjamanData) => void; }) => {
    // STATE UNTUK FORM UTAMA
    const [formData, setFormData] = useState<FormDataState>({
        noBukti: `PJ-${Date.now().toString().slice(-6)}`,
        jumlahPinjaman: 0,
        jangkaWaktu: 12,
        bunga: 1.5,
        tanggalPinjam: new Date().toISOString().split('T')[0],
        keperluan: '',
        jaminan: '',
    });

    // STATE BARU UNTUK LOGIKA PENCARIAN ANGGOTA
    const [namaAnggota, setNamaAnggota] = useState(''); // Teks yang diketik pengguna
    const [hasilPencarian, setHasilPencarian] = useState<typeof mockAnggotaDB>([]);
    const [anggotaTerpilih, setAnggotaTerpilih] = useState<{ id: string; nama: string; pekerjaan: string } | null>(null);
    const [tidakDitemukan, setTidakDitemukan] = useState(false);

    // EFEK UNTUK PENCARIAN DENGAN DEBOUNCING
    useEffect(() => {
        if (!namaAnggota || anggotaTerpilih) {
            setHasilPencarian([]);
            setTidakDitemukan(false);
            return;
        }
        const handler = setTimeout(() => {
            const hasil = mockAnggotaDB.filter(anggota =>
                anggota.nama.toLowerCase().includes(namaAnggota.toLowerCase())
            );
            setHasilPencarian(hasil);
            setTidakDitemukan(hasil.length === 0 && namaAnggota !== '');
        }, 300);
        return () => clearTimeout(handler);
    }, [namaAnggota, anggotaTerpilih]);

    // Fungsi untuk menangani perubahan input form biasa
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Fungsi saat user mengetik nama anggota
    const handleCariAnggota = (e: ChangeEvent<HTMLInputElement>) => {
        const nama = e.target.value;
        setNamaAnggota(nama);
        setAnggotaTerpilih(null);
    };

    // Fungsi saat user memilih anggota dari dropdown
    const handlePilihAnggota = (anggota: { id: string; nama: string; pekerjaan: string }) => {
        setAnggotaTerpilih(anggota);
        setNamaAnggota(anggota.nama);
        setHasilPencarian([]);
    };
    
    // Fungsi saat form disubmit
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!anggotaTerpilih) return;
        const dataFinal: NewPinjamanData = {
            noBukti: formData.noBukti,
            tanggalPinjam: formData.tanggalPinjam,
            keperluan: formData.keperluan,
            jaminan: formData.jaminan,
            anggotaId: anggotaTerpilih.id,
            pekerjaan: anggotaTerpilih.pekerjaan,
            jumlahPinjaman: Number(formData.jumlahPinjaman) || 0,
            jangkaWaktu: Number(formData.jangkaWaktu) || 0,
            bunga: Number(formData.bunga) || 0,
        };
        onSave(dataFinal);
        onClose();
    };

    // Reset state saat modal ditutup atau dibuka
    useEffect(() => {
        if (isOpen) {
            setFormData({
                noBukti: `PJ-${Date.now().toString().slice(-6)}`,
                jumlahPinjaman: 0,
                jangkaWaktu: 12,
                bunga: 1.5,
                tanggalPinjam: new Date().toISOString().split('T')[0],
                keperluan: '',
                jaminan: '',
            });
            setNamaAnggota('');
            setAnggotaTerpilih(null);
            setHasilPencarian([]);
            setTidakDitemukan(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Formulir Pengajuan Pinjaman</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label htmlFor="anggotaId" className="block text-sm font-medium text-gray-700">Anggota*</label>
                                <input
                                    type="text"
                                    id="anggotaId"
                                    name="anggotaId"
                                    required
                                    placeholder="Ketik untuk mencari nama anggota..."
                                    value={namaAnggota}
                                    onChange={handleCariAnggota}
                                    className="mt-1 w-full p-2 border rounded-lg"
                                    autoComplete="off"
                                />
                                {hasilPencarian.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
                                        {hasilPencarian.map(anggota => (
                                            <div
                                                key={anggota.id}
                                                onClick={() => handlePilihAnggota(anggota)}
                                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            >
                                                {anggota.nama}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {tidakDitemukan && (
                                    <p className="text-sm text-red-600 mt-1">Anggota tidak ditemukan.</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">Pekerjaan</label>
                                <input type="text" id="pekerjaan" name="pekerjaan" value={anggotaTerpilih?.pekerjaan || ''} readOnly className="mt-1 w-full p-2 border rounded-lg bg-gray-100" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="noBukti" className="block text-sm font-medium text-gray-700">No. Bukti</label>
                                <input type="text" id="noBukti" name="noBukti" required value={formData.noBukti} className="mt-1 w-full p-2 border rounded-lg bg-gray-100" readOnly />
                            </div>
                            <div>
                                <label htmlFor="tanggalPinjam" className="block text-sm font-medium text-gray-700">Tanggal Pinjam</label>
                                <input type="date" id="tanggalPinjam" name="tanggalPinjam" required value={formData.tanggalPinjam} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="jumlahPinjaman" className="block text-sm font-medium text-gray-700">Jumlah Pinjaman (Rp)*</label>
                                <input type="number" id="jumlahPinjaman" name="jumlahPinjaman" required value={formData.jumlahPinjaman} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="jangkaWaktu" className="block text-sm font-medium text-gray-700">Jangka Waktu (Bulan)*</label>
                                <input type="number" id="jangkaWaktu" name="jangkaWaktu" required value={formData.jangkaWaktu} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label htmlFor="bunga" className="block text-sm font-medium text-gray-700">Jasa (% per bulan)</label>
                                <input type="number" step="0.1" id="bunga" name="bunga" required value={formData.bunga} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="keperluan" className="block text-sm font-medium text-gray-700">Keperluan Pinjaman</label>
                            <textarea id="keperluan" name="keperluan" rows={2} placeholder="Contoh: Modal usaha, biaya pendidikan..." value={formData.keperluan} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="jaminan" className="block text-sm font-medium text-gray-700">Jaminan</label>
                            <input type="text" id="jaminan" name="jaminan" placeholder="Contoh: BPKB Motor, Sertifikat Rumah..." value={formData.jaminan} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={!anggotaTerpilih}>Simpan Pinjaman</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================
// KOMPONEN MODAL DETAIL PINJAMAN & ANGSURAN
// ===================================================================
const DetailPinjamanModal = ({ isOpen, onClose, pinjaman }: { isOpen: boolean; onClose: () => void; pinjaman: Pinjaman | null; }) => {
    const [tampilkanRiwayat, setTampilkanRiwayat] = useState(false);

    const detailAngsuran = useMemo(() => {
        if (!pinjaman) return null;

        const angsuranPokok = pinjaman.jangkaWaktu > 0 ? pinjaman.jumlahPinjaman / pinjaman.jangkaWaktu : 0;
        const jasaPerBulan = pinjaman.jumlahPinjaman * (pinjaman.bunga / 100);
        const totalAngsuranPerBulan = angsuranPokok + jasaPerBulan;

        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        const semuaAngsuran = Array.from({ length: pinjaman.jangkaWaktu }, (_, i) => {
            const tanggalJatuhTempo = new Date(pinjaman.tanggalPinjam);
            tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + i + 1);
            tanggalJatuhTempo.setHours(0, 0, 0, 0);
            
            const statusSimulasi = hariIni > tanggalJatuhTempo ? 'Terbayar' : 'Belum Dibayar';
            const batasTampilTombol = new Date(tanggalJatuhTempo);
            batasTampilTombol.setDate(batasTampilTombol.getDate() - 7);

            let kondisiAksi = 'MENUNGGU';
            if (statusSimulasi === 'Terbayar') {
                kondisiAksi = 'LUNAS';
            } else if (hariIni >= batasTampilTombol) {
                kondisiAksi = 'SIAP_BAYAR';
            }

            return {
                ke: i + 1,
                jatuhTempo: tanggalJatuhTempo,
                status: statusSimulasi,
                kondisiAksi: kondisiAksi,
            };
        });

        const angsuranTerbayar = semuaAngsuran.filter(a => a.status === 'Terbayar');
        const angsuranBerikutnya = semuaAngsuran.find(a => a.status === 'Belum Dibayar');

        return {
            totalAngsuranPerBulan,
            semuaAngsuran,
            angsuranTerbayar,
            angsuranBerikutnya,
        };
    }, [pinjaman]);

    if (!isOpen || !pinjaman || !detailAngsuran) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Detail Pinjaman: {pinjaman.anggota.nama}</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500">Jumlah Pinjaman</p><p className="font-bold text-lg">Rp {pinjaman.jumlahPinjaman.toLocaleString('id-ID')}</p></div>
                        <div><p className="text-gray-500">Jangka Waktu</p><p className="font-bold">{pinjaman.jangkaWaktu} Bulan</p></div>
                        <div><p className="text-gray-500">Jasa</p><p className="font-bold">{pinjaman.bunga}% / Bulan</p></div>
                        <div><p className="text-gray-500">Status</p><p className={`font-bold ${pinjaman.status === 'Lunas' ? 'text-green-600' : 'text-yellow-600'}`}>{pinjaman.status}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-800 mb-2">Angsuran Berikutnya</h3>
                            {detailAngsuran.angsuranBerikutnya ? (
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>Angsuran Ke:</span><span className="font-medium">{detailAngsuran.angsuranBerikutnya.ke}</span></div>
                                    <div className="flex justify-between"><span>Jatuh Tempo:</span><span className="font-medium">{detailAngsuran.angsuranBerikutnya.jatuhTempo.toLocaleDateString('id-ID')}</span></div>
                                    <hr className="my-1"/>
                                    <div className="flex justify-between font-bold text-base"><span>Jumlah Bayar:</span><span>Rp {detailAngsuran.totalAngsuranPerBulan.toLocaleString('id-ID')}</span></div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">Semua angsuran telah lunas.</p>
                            )}
                        </div>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h3 className="font-bold text-green-800 mb-2">Angsuran Selesai</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>Total Terbayar:</span><span className="font-medium">{detailAngsuran.angsuranTerbayar.length} dari {pinjaman.jangkaWaktu} angsuran</span></div>
                                <hr className="my-1"/>
                                <div className="flex justify-between font-bold text-base">
                                    <span>Jumlah Dana Kembali:</span>
                                    <span>Rp {(detailAngsuran.angsuranTerbayar.length * detailAngsuran.totalAnguranPerBulan).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button onClick={() => setTampilkanRiwayat(!tampilkanRiwayat)} className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg">
                            <span className="font-bold text-gray-700">Riwayat Angsuran Lengkap</span>
                            <ChevronDown className={`transition-transform ${tampilkanRiwayat ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {tampilkanRiwayat && (
                         <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-3 font-medium">Angsuran Ke-</th>
                                        <th className="p-3 font-medium">Jatuh Tempo</th>
                                        <th className="p-3 font-medium">Total Bayar</th>
                                        <th className="p-3 font-medium">Status</th>
                                        <th className="p-3 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailAngsuran.semuaAngsuran.map(ang => (
                                        <tr key={ang.ke} className="border-t">
                                            <td className="p-3">{ang.ke}</td>
                                            <td className="p-3">{ang.jatuhTempo.toLocaleDateString('id-ID')}</td>
                                            <td className="p-3 font-medium">Rp {detailAngsuran.totalAngsuranPerBulan.toLocaleString('id-ID')}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${ang.status === 'Terbayar' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{ang.status}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                {ang.kondisiAksi === 'LUNAS' && (
                                                    <div className="flex justify-center items-center gap-1 text-green-600">
                                                        <CheckCircle2 size={14} />
                                                        <span className="text-xs font-semibold">Lunas</span>
                                                    </div>
                                                )}
                                                {ang.kondisiAksi === 'SIAP_BAYAR' && (
                                                    <Button size="sm" variant="outline">Bayar</Button>
                                                )}
                                                {ang.kondisiAksi === 'MENUNGGU' && (
                                                    <div className="flex justify-center items-center gap-1 text-gray-500">
                                                        <Hourglass size={14} />
                                                        <span className="text-xs">Menunggu</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
                    <Button type="button" variant="primary" onClick={onClose}>Tutup</Button>
                </div>
            </div>
        </div>
    );
};



// ===================================================================
// KOMPONEN UTAMA HALAMAN
// ===================================================================
export default function PinjamanAnggotaPage() {
    const [filters, setFilters] = useState({ search: '', status: '', tanggalMulai: '', tanggalSelesai: '' });
    const [pinjamanList, setPinjamanList] = useState<Pinjaman[]>(mockPinjaman);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPinjaman, setSelectedPinjaman] = useState<Pinjaman | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ search: '', status: '', tanggalMulai: '', tanggalSelesai: '' });
    };

    const filteredPinjaman = useMemo(() => {
        return pinjamanList.filter(pinjaman => {
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
    }, [filters, pinjamanList]);
    
    const handleNotifikasiMassal = () => {
        const pinjamanAktifCount = pinjamanList.filter(p => p.status === 'Aktif').length;
        if (window.confirm(`Anda akan mengirim notifikasi jatuh tempo ke ${pinjamanAktifCount} anggota. Lanjutkan?`)) {
            alert("Simulasi: Notifikasi massal berhasil dikirim.");
        }
    };
    
    const handleNotifikasiIndividual = (nama: string) => {
        alert(`Simulasi: Notifikasi jatuh tempo berhasil dikirim ke anggota "${nama}".`);
    };

// Di dalam komponen PinjamanAnggotaPage

// GANTI FUNGSI LAMA INI...
// const handleSavePinjaman = (data: NewPinjamanData) => { ... };

// DENGAN FUNGSI BARU YANG SUDAH DIPERBAIKI INI:
    const handleSavePinjaman = (data: NewPinjamanData) => {
        // 1. Cari informasi lengkap anggota dari database simulasi kita
        const anggotaInfo = mockAnggotaDB.find(anggota => anggota.id === data.anggotaId);

        // 2. Lakukan pengecekan jika anggota tidak ditemukan (untuk keamanan)
        if (!anggotaInfo) {
            alert("Error: Gagal menemukan data anggota. Mohon coba lagi.");
            return;
        }

        // 3. Buat objek pinjaman baru dengan nama yang benar
        const newPinjaman: Pinjaman = {
            id: `pinj${Date.now()}`,
            status: 'Aktif',
            tanggalLunas: null,
            anggota: { 
                id: anggotaInfo.id, 
                nama: anggotaInfo.nama // <-- SEKARANG MENGGUNAKAN NAMA YANG BENAR
            },
            noBukti: data.noBukti,
            jumlahPinjaman: data.jumlahPinjaman,
            jangkaWaktu: data.jangkaWaktu,
            bunga: data.bunga,
            tanggalPinjam: data.tanggalPinjam,
            pekerjaan: data.pekerjaan,
            keperluan: data.keperluan,
            jaminan: data.jaminan
        };

        setPinjamanList(prev => [newPinjaman, ...prev]);
        console.log("Data Pinjaman Baru:", newPinjaman);
        alert(`Simulasi: Pinjaman baru untuk ${anggotaInfo.nama} berhasil disimpan.`); // Tampilkan nama di notifikasi
    };

    const handleLihatDetail = (pinjaman: Pinjaman) => {
        setSelectedPinjaman(pinjaman);
        setIsDetailModalOpen(true);
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
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <button 
                                                    onClick={() => handleLihatDetail(pinjaman)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                    title="Lihat Detail Pinjaman & Angsuran"
                                                >
                                                    <MoreHorizontal size={20}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleNotifikasiIndividual(pinjaman.anggota.nama)}
                                                    disabled={pinjaman.status === 'Lunas'}
                                                    className="text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={pinjaman.status === 'Lunas' ? 'Pinjaman sudah lunas' : 'Kirim notifikasi jatuh tempo'}
                                                >
                                                    <Send size={16}/>
                                                </button>
                                            </div>
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

            <DetailPinjamanModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                pinjaman={selectedPinjaman}
            />
        </div>
    );
}