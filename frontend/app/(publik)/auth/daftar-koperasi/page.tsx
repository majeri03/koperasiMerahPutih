"use client";

import { useState, FormEvent, ChangeEvent } from "react"; // Import ChangeEvent
import Link from 'next/link';
import Image from "next/image";
// FiSearch dihapus karena field pencarian dihilangkan
import { FiLock, FiEye, FiEyeOff, FiUpload } from 'react-icons/fi'; // Import FiUpload

export default function DaftarKoperasiPage() {
  // State untuk semua field di form
  const [formData, setFormData] = useState({
    // nomorInduk: '', // Dihapus sesuai permintaan
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
    ulangiKataSandi: '',
    // Tambahkan state untuk file (inisialisasi null)
    filePengesahan: null as File | null,
    fileDaftarUmum: null as File | null,
    fileAkte: null as File | null,
    fileNpwp: null as File | null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showUlangiPassword, setShowUlangiPassword] = useState(false);

  // Handler untuk mengubah state saat input diisi
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Khusus untuk input file
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setFormData(prevState => ({
          ...prevState,
          [name]: fileInput.files![0] // Ambil file pertama
        }));
      } else {
        // Handle jika user membatalkan pemilihan file
        setFormData(prevState => ({
          ...prevState,
          [name]: null
        }));
      }
    } else {
      // Untuk input selain file
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formData.kataSandi !== formData.ulangiKataSandi) {
      alert("Password dan Ulangi Kata Sandi tidak cocok!");
      return;
    }
    // TODO: Tambahkan validasi untuk memastikan file sudah diunggah jika diperlukan
    console.log("Data Pendaftaran Koperasi:", formData);
    // Di sini nanti akan ada logika untuk mengirim data form (termasuk file) ke backend
    alert("Permohonan Akun Koperasi Terkirim (lihat data di console). Proses upload file belum diimplementasikan.");
  };

  // Helper untuk menampilkan nama file yang dipilih
  const renderFileName = (file: File | null) => {
    if (file) {
      return <span className="text-sm text-gray-600 ml-2">{file.name}</span>;
    }
    return <span className="text-sm text-gray-500 ml-2">Belum ada file dipilih</span>;
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
            
            {/* --- FIELDSET PENCARIAN KOPERASI DIHAPUS --- */}
            
            {/* Kedudukan Koperasi (Input Manual) */}
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 w-full">Kedudukan Koperasi</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="namaKoperasi" className="block text-sm font-medium text-gray-700">Nama Koperasi <span className="text-red-500">*</span></label>
                    <input id="namaKoperasi" name="namaKoperasi" type="text" required value={formData.namaKoperasi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                    <label htmlFor="skAhu" className="block text-sm font-medium text-gray-700">SK AHU Koperasi <span className="text-red-500">*</span></label>
                    <input id="skAhu" name="skAhu" type="text" required value={formData.skAhu} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                    <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700">Provinsi <span className="text-red-500">*</span></label>
                    <input id="provinsi" name="provinsi" type="text" required value={formData.provinsi} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                    <label htmlFor="kabupaten" className="block text-sm font-medium text-gray-700">Kabupaten/Kota <span className="text-red-500">*</span></label>
                    <input id="kabupaten" name="kabupaten" type="text" required value={formData.kabupaten} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                    <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700">Kecamatan <span className="text-red-500">*</span></label>
                    <input id="kecamatan" name="kecamatan" type="text" required value={formData.kecamatan} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                    <label htmlFor="kelurahan" className="block text-sm font-medium text-gray-700">Desa/Kelurahan <span className="text-red-500">*</span></label>
                    <input id="kelurahan" name="kelurahan" type="text" required value={formData.kelurahan} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </div>
                <div>
                    <label htmlFor="alamatLengkap" className="block text-sm font-medium text-gray-700">Alamat Lengkap <span className="text-red-500">*</span></label>
                    <textarea id="alamatLengkap" name="alamatLengkap" rows={3} required value={formData.alamatLengkap} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Peta Lokasi</label>
                    <div className="mt-1 w-full h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                    [ Peta Lokasi akan ditampilkan di sini ]
                    </div>
                </div>
            </fieldset>

            {/* Informasi Akun */}
            <fieldset className="space-y-4">
               {/* ... (konten fieldset Informasi Akun tidak berubah) ... */}
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

            {/* --- FIELDSET BARU UNTUK DOKUMEN --- */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 w-full">Dokumen Pendukung</legend>
              <p className="text-sm text-gray-500">Unggah dokumen yang diperlukan dalam format PDF, JPG, atau PNG (maksimal 5MB per file).</p>

              {/* Input File Pengesahan */}
              <div>
                <label htmlFor="filePengesahan" className="block text-sm font-medium text-gray-700 mb-1">Pengesahan Pendirian Badan Hukum <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <label htmlFor="filePengesahan" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FiUpload className="h-4 w-4" />
                    Pilih File
                  </label>
                  <input id="filePengesahan" name="filePengesahan" type="file" required className="sr-only" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png"/>
                  {renderFileName(formData.filePengesahan)}
                </div>
              </div>

              {/* Input File Daftar Umum */}
              <div>
                <label htmlFor="fileDaftarUmum" className="block text-sm font-medium text-gray-700 mb-1">Daftar Umum Koperasi <span className="text-red-500">*</span></label>
                 <div className="flex items-center">
                  <label htmlFor="fileDaftarUmum" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FiUpload className="h-4 w-4" />
                    Pilih File
                  </label>
                  <input id="fileDaftarUmum" name="fileDaftarUmum" type="file" required className="sr-only" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png"/>
                  {renderFileName(formData.fileDaftarUmum)}
                </div>
              </div>

              {/* Input File Akte Notaris */}
              <div>
                <label htmlFor="fileAkte" className="block text-sm font-medium text-gray-700 mb-1">Akte Notaris Pendirian <span className="text-red-500">*</span></label>
                 <div className="flex items-center">
                  <label htmlFor="fileAkte" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FiUpload className="h-4 w-4" />
                    Pilih File
                  </label>
                  <input id="fileAkte" name="fileAkte" type="file" required className="sr-only" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png"/>
                  {renderFileName(formData.fileAkte)}
                </div>
              </div>

              {/* Input File NPWP */}
              <div>
                <label htmlFor="fileNpwp" className="block text-sm font-medium text-gray-700 mb-1">NPWP Koperasi <span className="text-red-500">*</span></label>
                 <div className="flex items-center">
                  <label htmlFor="fileNpwp" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FiUpload className="h-4 w-4" />
                    Pilih File
                  </label>
                  <input id="fileNpwp" name="fileNpwp" type="file" required className="sr-only" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png"/>
                  {renderFileName(formData.fileNpwp)}
                </div>
              </div>

            </fieldset>
            {/* --- AKHIR FIELDSET DOKUMEN --- */}


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