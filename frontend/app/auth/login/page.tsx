// File: app/auth/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from 'next/link';
// Import ikon mata yang baru
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State baru untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log({
      email: email,
      password: password,
    });
    alert(`Data Login Terkirim (lihat di console):\nEmail: ${email}`);
    // Di sini nanti akan ada logika untuk mengirim data ke API backend
  };

  // Fungsi untuk mengubah visibilitas password
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
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Masuk Akun</h1>
            <p className="mt-2 text-sm text-gray-600">
              Selamat datang kembali! Silakan masukkan data Anda.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input untuk Email dengan Ikon */}
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-red-600 focus:border-brand-red-600"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            {/* Input untuk Password dengan Ikon Mata */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Kata Sandi</label>
              <div className="mt-1 relative">
                 {/* Ikon Gembok di Kiri */}
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  // Type diubah secara dinamis berdasarkan state showPassword
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-red-600 focus:border-brand-red-600"
                  placeholder="********"
                />
                {/* Ikon Mata di Kanan */}
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility} // Tambahkan event handler untuk klik
                >
                  {/* Tampilkan ikon mata yang sesuai */}
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right text-sm">
              <a href="#" className="font-medium text-brand-red-600 hover:text-red-500">
                Lupa Kata Sandi?
              </a>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red-600 hover:bg-brand-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red-600"
              >
                Masuk
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-center text-gray-600">
            Belum punya akun?{' '}
            <Link href="/auth/daftar" className="font-medium text-brand-red-600 hover:text-red-500">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}