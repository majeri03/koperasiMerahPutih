// frontend/lib/api.ts

// Tipe data sederhana untuk payload JWT (sesuaikan jika backend mengirim lebih banyak data)
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  // tambahkan properti lain jika ada (iat, exp, dll.)
  fullName?: string; // Opsional dulu
}

// 1. Ambil Base URL dari environment variable
// Pastikan NEXT_PUBLIC_API_BASE_URL sudah diatur di .env.local (misal: http://localhost:3001)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Helper untuk mendapatkan access token dari localStorage.
 * Hanya berjalan di sisi client.
 * @returns {string | null} Access token atau null jika tidak ada/di server.
 */
const getAccessToken = (): string | null => {
  // typeof window !== 'undefined' memastikan kode ini hanya berjalan di browser
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Tipe untuk opsi fetch tambahan
interface FetchOptions extends RequestInit {
  useAuth?: boolean; // Flag: kirim token otentikasi? (default: true)
}

/**
 * Wrapper fetch global untuk komunikasi dengan API backend.
 * Secara otomatis menambahkan header Authorization jika diperlukan.
 * @template T Tipe data yang diharapkan dari respons JSON.
 * @param {string} endpoint Path API setelah base URL (misal: '/auth/login').
 * @param {FetchOptions} options Opsi standar fetch ditambah `useAuth`.
 * @returns {Promise<T>} Promise yang resolve dengan data JSON dari respons.
 * @throws {Error} Jika network error atau respons API mengindikasikan error.
 */
async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Pastikan base URL ada
  if (!API_BASE_URL) {
    console.error("API base URL missing in environment variables!"); // Log error
    throw new Error("API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in your environment variables.");
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const { useAuth = true, headers: customHeaders, ...restOptions } = options;

  // Inisialisasi sebagai Record<string, string> untuk keamanan tipe
  const headers: Record<string, string> = {
    'Content-Type': 'application/json', // Default content type
    ...(customHeaders as Record<string, string>), // Gabungkan header custom (asumsikan object)
  };

  // Tambahkan token Authorization jika useAuth true dan token ada di localStorage
  if (useAuth) {
    const token = getAccessToken();
    if (token) {
      // Sekarang aman untuk menambahkan properti Authorization
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn(`Attempting to call authenticated endpoint ${endpoint} without an access token.`);
    }
  }

  try {
    // Log URL dan Opsi (token disensor untuk keamanan log)
    console.log(`Attempting to fetch: ${url} with options:`, { ...restOptions, headers: { ...headers, Authorization: headers['Authorization'] ? 'Bearer [REDACTED]' : undefined } });
    const response = await fetch(url, { //
      ...restOptions,
      headers, // Pass the headers object here
    });

    console.log(`Response status from ${endpoint}: ${response.status}`); // Log status respons

    // Coba parse JSON, tapi tangani jika respons kosong (misal status 204 No Content)
    let data: T | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && response.status !== 204) {
       try {
         data = await response.json();
       } catch (jsonError: any) {
          // Jika parsing gagal tapi status OK (misal 200 tapi body aneh), anggap error
          if(response.ok) {
             console.error(`API response from ${endpoint} was OK but JSON parsing failed:`, jsonError);
             throw new Error('Gagal memproses respons dari server.');
          }
          // Jika status tidak OK dan parsing gagal, biarkan error asli dari !response.ok di bawah
          console.error(`API response from ${endpoint} failed (${response.status}) and JSON parsing also failed:`, jsonError);
          // Kita akan melempar error berdasarkan status di bawah
       }
    }

    // Jika respons tidak OK (status bukan 2xx)
    if (!response.ok) {
      // Jika ada data JSON di respons error (umumnya dari NestJS), gunakan pesannya
      // Jika tidak, gunakan status text default
      const errorMessage = (data as any)?.message || response.statusText || `HTTP error! status: ${response.status}`;
      console.error(`API Error (${response.status}) on ${endpoint}:`, data || errorMessage); //
      throw new Error(errorMessage); //
    }

    // Kembalikan data (bisa null jika status 204 atau respons bukan JSON tapi OK)
    return data as T;

  } catch (error) { // Tangani error fetch (network error) seperti "Failed to fetch"
    console.error(`Network or processing error fetching ${endpoint}:`, error);
    // Lempar error yang lebih spesifik jika memungkinkan, atau error generik
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Failed to fetch'); // Error koneksi jaringan
    }
    // Re-throw error lain yang mungkin terjadi (termasuk yang dilempar dari blok try)
    throw error;
  }
}

/**
 * Fungsi spesifik untuk melakukan login.
 * @param {string} email Email pengguna.
 * @param {string} password Password pengguna.
 * @returns {Promise<{ accessToken: string; refreshToken: string }>} Promise berisi token.
 */
export async function apiLogin(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
  // Panggil fetchApi, login tidak memerlukan token (useAuth: false)
  return fetchApi<{ accessToken: string; refreshToken: string }>('/auth/login', { //
    method: 'POST',
    body: JSON.stringify({ email, password }),
    useAuth: false, // Penting: Jangan kirim token saat login
  });
}

/**
 * Contoh fungsi untuk mengambil profil pengguna (memerlukan token).
 * @returns {Promise<JwtPayload>} Promise berisi data profil pengguna.
 */
export async function apiGetProfile(): Promise<JwtPayload> {
  // Panggil fetchApi, secara default akan mengirim token jika ada (useAuth: true)
  return fetchApi<JwtPayload>('/auth/profile', { //
    method: 'GET',
    // useAuth: true (ini default, jadi tidak perlu ditulis)
  });
}

/**
 * Fungsi Logout Sederhana. Menghapus token dari localStorage.
 * Redirect harus dilakukan di komponen setelah memanggil fungsi ini.
 */
export function apiLogout(): void {
   if (typeof window !== 'undefined') {
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
     console.log('Tokens removed from localStorage.');
     // Contoh redirect: window.location.href = '/auth/login'; (lebih baik pakai router.push di komponen)
   }
}

// --- Tambahkan fungsi API lainnya di sini sesuai kebutuhan ---

// Ekspor fungsi yang akan digunakan di komponen lain
export { fetchApi, getAccessToken };