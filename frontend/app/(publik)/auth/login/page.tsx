// File: frontend/app/(publik)/auth/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { apiLogin } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Panggil apiLogin
      const { accessToken, refreshToken } = await apiLogin(email, password); //

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('Login berhasil, token disimpan di localStorage.');
      }

      router.push('/dashboard/anggota');

    } catch (err: any) {
      console.error('Login failed in handleSubmit:', err);
      // Tangkap error "Failed to fetch" atau error dari backend
      setError(err.message === 'Failed to fetch' ? 'Gagal terhubung ke server. Pastikan server backend berjalan.' : err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[90vh]">
      {/* Kolom Kiri (Branding) */}
      <div className="hidden md:flex flex-col justify-center items-center bg-brand-red-600 text-white p-12">
        <h1 className="text-4xl font-bold">Koperasi Digital</h1>
        <h2 className="text-5xl font-extrabold mt-2">MERAH PUTIH</h2>
        <p className="mt-4 text-center text-red-100">
          Mewujudkan Koperasi Modern yang transparan, efisien, dan mensejahterakan Anggota.
        </p>
      </div>

      {/* Kolom Kanan (Form) */}
      <div className="flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Judul Form */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Masuk Akun</h1>
            <p className="mt-2 text-sm text-gray-600">
              Selamat datang kembali! Silakan masukkan data Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-red-600 focus:border-brand-red-600 disabled:bg-gray-100"
                  placeholder="anda@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Kata Sandi</label>
              <div className="mt-1 relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-red-600 focus:border-brand-red-600 disabled:bg-gray-100"
                  placeholder="********"
                  disabled={loading}
                />
                <div
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={!loading ? togglePasswordVisibility : undefined}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Tampilkan Pesan Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {/* Lupa Password */}
            <div className="text-right text-sm">
              <Link href="#" className="font-medium text-brand-red-600 hover:text-red-500">
                Lupa Kata Sandi?
              </Link>
            </div>

            {/* Tombol Submit */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red-600 hover:bg-brand-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>

          {/* Link ke Halaman Daftar */}
          <p className="mt-8 text-sm text-center text-gray-600">
            Belum punya akun?{' '}
            <Link href="/auth/daftar-anggota" className="font-medium text-brand-red-600 hover:text-red-500">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}