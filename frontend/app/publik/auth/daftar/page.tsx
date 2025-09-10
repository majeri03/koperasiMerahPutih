"use client";

import { useState, FormEvent } from "react";
import Link from 'next/link';
import Image from "next/image";
import { FiSearch, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function DaftarKoperasiPage() {
  // State untuk semua field di form
  const [formData, setFormData] = useState({
    nomorInduk: '',
    skAhu: '',
    namaKoperasi: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    kelurahan: '',
    alamatLengkap: '',
    namaPengurus: '',
    emailKoperasi: '',
    noTelepon: '',
    kataSandi: '',
    ulangiKataSandi: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showUlangiPassword, setShowUlangiPassword] = useState(false);

  // Handler untuk mengubah state saat input diisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formData.kataSandi !== formData.ulangiKataSandi) {
      alert("Password dan Ulangi Kata Sandi tidak cocok!");
      return;
    }
    console.log("Data Pendaftaran Koperasi:", formData);
    alert("Permohonan Akun Koperasi Terkirim (lihat data di console).");
  };

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-red-700">Form Permohonan Akun Koperasi</h1>
            <p className="mt-2 text-gray-600">Daftarkan Koperasi Desa/Kelurahan Anda ke dalam sistem.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pencarian Koperasi */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 w-full">Pencarian Koperasi</legend>
              <div>
                <label htmlFor="nomorInduk" className="block text-sm font-medium text-gray-700">Nomor Induk Koperasi/SK AHU Koperasi <span className="text-red-500">*</span></label>
                <div className="mt-1 relative">
                  <input id="nomorInduk" name="nomorInduk" type="text" required value={formData.nomorInduk} onChange={handleChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md" />
                  <button type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                    <FiSearch />
                  </button>
                </div>
              </div>
            </fieldset>

            {/* Kedudukan Koperasi */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 w-full">Kedudukan Koperasi</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="namaKoperasi" className="block text-sm font-medium text-gray-700">Nama Koperasi</label>
                  <input id="namaKoperasi" name="namaKoperasi" type="text" value={formData.namaKoperasi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
                </div>
                <div>
                  <label htmlFor="skAhu" className="block text-sm font-medium text-gray-700">SK AHU Koperasi</label>
                  <input id="skAhu" name="skAhu" type="text" value={formData.skAhu} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
                </div>
                <div>
                  <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700">Provinsi</label>
                  <input id="provinsi" name="provinsi" type="text" value={formData.provinsi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
                </div>
                <div>
                  <label htmlFor="kabupaten" className="block text-sm font-medium text-gray-700">Kabupaten/Kota</label>
                  <input id="kabupaten" name="kabupaten" type="text" value={formData.kabupaten} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
                </div>
                 <div>
                  <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700">Kecamatan</label>
                  <input id="kecamatan" name="kecamatan" type="text" value={formData.kecamatan} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
                </div>
                <div>
                  <label htmlFor="kelurahan" className="block text-sm font-medium text-gray-700">Desa/Kelurahan</label>
                  <input id="kelurahan" name="kelurahan" type="text" value={formData.kelurahan} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
                </div>
              </div>
              <div>
                <label htmlFor="alamatLengkap" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                <textarea id="alamatLengkap" name="alamatLengkap" rows={3} value={formData.alamatLengkap} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Peta Lokasi</label>
                <div className="mt-1 w-full h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                  {/* Placeholder untuk Peta Interaktif */}
                  [ Peta Lokasi akan ditampilkan di sini ]
                </div>
              </div>
            </fieldset>

            {/* Informasi Akun */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 w-full">Informasi Akun</legend>
              <p className="text-sm text-gray-500">Permohonan akun hanya dapat diajukan oleh pengurus koperasi dengan data yang terdaftar pada AHU.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="namaPengurus" className="block text-sm font-medium text-gray-700">Nama Salah Satu Pengurus Koperasi <span className="text-red-500">*</span></label>
                  <input id="namaPengurus" name="namaPengurus" type="text" required value={formData.namaPengurus} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="noTelepon" className="block text-sm font-medium text-gray-700">No. Telepon Salah Satu Pengurus <span className="text-red-500">*</span></label>
                  <input id="noTelepon" name="noTelepon" type="tel" required value={formData.noTelepon} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="emailKoperasi" className="block text-sm font-medium text-gray-700">Email Khusus Koperasi (Hindari Email Pribadi) <span className="text-red-500">*</span></label>
                <input id="emailKoperasi" name="emailKoperasi" type="email" required value={formData.emailKoperasi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kataSandi" className="block text-sm font-medium text-gray-700">Kata Sandi <span className="text-red-500">*</span></label>
                  <div className="relative mt-1">
                    <input id="kataSandi" name="kataSandi" type={showPassword ? "text" : "password"} required value={formData.kataSandi} onChange={handleChange} className="w-full p-2 pr-10 border border-gray-300 rounded-md" />
                    <button type="button" className="absolute inset-y-0 right-0 px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="ulangiKataSandi" className="block text-sm font-medium text-gray-700">Ulangi Kata Sandi <span className="text-red-500">*</span></label>
                  <div className="relative mt-1">
                    <input id="ulangiKataSandi" name="ulangiKataSandi" type={showUlangiPassword ? "text" : "password"} required value={formData.ulangiKataSandi} onChange={handleChange} className="w-full p-2 pr-10 border border-gray-300 rounded-md" />
                    <button type="button" className="absolute inset-y-0 right-0 px-3" onClick={() => setShowUlangiPassword(!showUlangiPassword)}>
                      {showUlangiPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end pt-4">
              <button type="submit" className="px-6 py-2 bg-brand-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-brand-red-700">
                Kirim Permohonan
              </button>
            </div>
          </form>
          
          <p className="mt-6 text-sm text-center text-gray-600">
            Sudah mendaftarkan koperasi Anda?{' '}
            <Link href="/auth/login" className="font-medium text-brand-red-600 hover:text-red-500">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}