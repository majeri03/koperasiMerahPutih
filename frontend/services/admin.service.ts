// frontend/services/admin.service.ts
import { api, parseApiError } from '@/lib/api';
import { MemberRegistration } from '@/types/api.types'; // Asumsi Anda punya tipe ini

// Wrapper (bisa copy dari auth.service.ts)
async function handleRequest<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Tipe sederhana untuk pendaftaran pending
// Anda mungkin perlu menyesuaikan ini dengan data yang dikirim backend
export type PendingRegistration = Omit<MemberRegistration, 'hashedPassword'>;

export const adminService = {
  /**
   * Mengambil daftar pendaftaran anggota yang pending
   * Endpoint: GET /member-registrations/pending
   */
  getPendingRegistrations: (): Promise<PendingRegistration[]> => {
    return handleRequest(api.get<PendingRegistration[]>('/member-registrations/pending'));
  },

  /**
   * Menyetujui pendaftaran anggota
   * Endpoint: POST /member-registrations/:id/approve
   */
  approveRegistration: (registrationId: string): Promise<{ message: string }> => {
    return handleRequest(
      api.post(`/member-registrations/${registrationId}/approve`),
    );
  },

  /**
   * Menolak pendaftaran anggota
   * Endpoint: POST /member-registrations/:id/reject
   */
  rejectRegistration: (
    registrationId: string,
    reason: string,
  ): Promise<{ message: string }> => {
    // Kirim alasan penolakan sebagai query parameter
    return handleRequest(
      api.post(`/member-registrations/${registrationId}/reject`, null, {
        params: { reason },
      }),
    );
  },
};