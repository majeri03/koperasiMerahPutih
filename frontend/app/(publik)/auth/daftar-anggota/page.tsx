// Lokasi: frontend/app/(publik)/auth/daftar-anggota/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "@/components/Button";

export default function DaftarAnggotaPage() {
  const [formData, setFormData] = useState({
    nik: "",
    namaLengkap: "",
    jenisKelamin: "",
    alamatEmail: "",
    nomorHp: "",
    kataSandi: "",
    ulangiKataSandi: "",
    provinsi: "",
    kabupatenKota: "",
    kecamatan: "",
    desaKelurahan: "",
    koperasi: "",
    captcha: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showUlangiPassword, setShowUlangiPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formData.kataSandi !== formData.ulangiKataSandi) {
      alert("Kata sandi dan konfirmasi kata sandi tidak cocok!");
      return;
    }
    // TODO: Kirim `formData` ke API backend Anda
    console.log("Data Pendaftaran Anggota:", formData);
    alert(
      "Permohonan pendaftaran Anda berhasil dikirim. Silakan tunggu persetujuan dari pengurus koperasi."
    );
  };

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold text-center text-brand-red-700">
            Pendaftaran Anggota Koperasi Desa/Kelurahan Merah Putih
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Lengkapi data di bawah ini untuk menjadi bagian dari kami.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* --- Informasi Pribadi --- */}
            <fieldset className="border p-4 rounded-lg">
              <legend className="text-lg font-semibold px-2 text-gray-800">
                Informasi Pribadi
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                <div>
                  <label htmlFor="nik" className="block text-sm font-medium text-gray-700">Nomor Induk Kependudukan*</label>
                  <input type="text" name="nik" id="nik" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700">Nama Lengkap*</label>
                  <input type="text" name="namaLengkap" id="namaLengkap" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">Jenis Kelamin*</label>
                  <select name="jenisKelamin" id="jenisKelamin" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="LAKI-LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="alamatEmail" className="block text-sm font-medium text-gray-700">Alamat Email*</label>
                  <input type="email" name="alamatEmail" id="alamatEmail" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="nomorHp" className="block text-sm font-medium text-gray-700">Nomor HP*</label>
                  <input type="tel" name="nomorHp" id="nomorHp" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="relative">
                  <label htmlFor="kataSandi" className="block text-sm font-medium text-gray-700">Buat Kata Sandi*</label>
                  <input type={showPassword ? "text" : "password"} name="kataSandi" id="kataSandi" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                  <button type="button" className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="relative">
                  <label htmlFor="ulangiKataSandi" className="block text-sm font-medium text-gray-700">Ulangi Kata Sandi*</label>
                  <input type={showUlangiPassword ? "text" : "password"} name="ulangiKataSandi" id="ulangiKataSandi" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                   <button type="button" className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500" onClick={() => setShowUlangiPassword(!showUlangiPassword)}>
                    {showUlangiPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </fieldset>

            {/* --- Informasi Koperasi --- */}
            <fieldset className="border p-4 rounded-lg">
              <legend className="text-lg font-semibold px-2 text-gray-800">
                Informasi Koperasi
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                {/* Anda perlu mengisi opsi dropdown ini dari API */}
                <div>
                  <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700">Provinsi*</label>
                  <select name="provinsi" id="provinsi" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"></select>
                </div>
                 <div>
                  <label htmlFor="kabupatenKota" className="block text-sm font-medium text-gray-700">Kabupaten/Kota*</label>
                  <select name="kabupatenKota" id="kabupatenKota" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"></select>
                </div>
                <div>
                  <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700">Kecamatan*</label>
                  <select name="kecamatan" id="kecamatan" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"></select>
                </div>
                <div>
                  <label htmlFor="desaKelurahan" className="block text-sm font-medium text-gray-700">Desa/Kelurahan*</label>
                  <select name="desaKelurahan" id="desaKelurahan" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"></select>
                </div>
                 <div className="md:col-span-2">
                  <label htmlFor="koperasi" className="block text-sm font-medium text-gray-700">Koperasi*</label>
                  <select name="koperasi" id="koperasi" required onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"></select>
                </div>
              </div>
            </fieldset>


            <div className="flex items-start">
                <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-brand-red-600 border-gray-300 rounded mt-1"/>
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                    Dengan ini saya menyatakan bersedia menjadi anggota Koperasi Desa/Kelurahan Merah Putih. Jika dalam kemudian hari ditemui ketidaksesuaian data, saya bersedia bertanggung jawab sesuai dengan perundangan yang berlaku.
                </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Kirim</Button>
            </div>
             <p className="mt-6 text-sm text-center text-gray-600">
                Sudah punya akun anggota?{' '}
                <Link href="/auth/login" className="font-medium text-brand-red-600 hover:text-red-500">
                    Masuk di sini
                </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}