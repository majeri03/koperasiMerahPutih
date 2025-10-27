// frontend/app/dashboard/admin/persetujuan-anggota/page.tsx
"use client";

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { adminService, PendingRegistration } from '@/services/admin.service'; // <-- Import service baru
import AdminPageHeader from '@/components/AdminPageHeader';
import Button from '@/components/Button';
import { ApiErrorResponse } from '@/types/api.types';

export default function PersetujuanAnggotaPage() {
  const [pendingList, setPendingList] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk memuat data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPendingRegistrations();
      setPendingList(data);
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError.message);
      toast.error(`Gagal memuat data: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Panggil loadData() saat halaman pertama kali dimuat
  useEffect(() => {
    loadData();
  }, []);

  // Handler untuk tombol Setujui
  const handleApprove = async (id: string) => {
    const toastId = toast.loading('Memproses persetujuan...');
    try {
      await adminService.approveRegistration(id);
      toast.success('Anggota berhasil disetujui.', { id: toastId });
      // Muat ulang data untuk menghapus item dari daftar
      loadData();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      toast.error(`Gagal: ${apiError.message}`, { id: toastId });
    }
  };

  // Handler untuk tombol Tolak
  const handleReject = async (id: string) => {
    // Minta alasan penolakan
    const reason = prompt('Masukkan alasan penolakan:');
    if (!reason || reason.trim() === '') {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }

    const toastId = toast.loading('Memproses penolakan...');
    try {
      await adminService.rejectRegistration(id, reason);
      toast.success('Pendaftaran berhasil ditolak.', { id: toastId });
      // Muat ulang data
      loadData();
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      toast.error(`Gagal: ${apiError.message}`, { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <AdminPageHeader title="Persetujuan Anggota" />
      
      <div className="p-4 bg-white rounded-lg shadow-md">
        {loading && <p>Memuat data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && pendingList.length === 0 && (
          <p>Tidak ada pendaftaran anggota yang menunggu persetujuan.</p>
        )}

        {!loading && !error && pendingList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingList.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{req.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{req.nik}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{req.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(req.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleApprove(req.id)}
                      >
                        Setujui
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleReject(req.id)}
                      >
                        Tolak
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}