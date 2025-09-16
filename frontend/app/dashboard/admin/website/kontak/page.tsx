// Lokasi: frontend/app/dashboard/admin/website/kontak/page.tsx
"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/AdminPageHeader";
import Button from "@/components/Button";
import { Save, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";

// --- Tipe Data ---
type InfoKontak = {
  alamat: string;
  telepon: string;
  email: string;
  jamOperasional: string;
  googleMapsEmbed: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
};

// --- Data Contoh (Data yang saat ini tampil di website) ---
const mockInfoKontak: InfoKontak = {
  alamat: "Jalan Koperasi Bersama No. 123, Makassar, Indonesia",
  telepon: "(0411) 1234567",
  email: "info@koperasimerahputih.id",
  jamOperasional: "Senin – Jumat, 08.00 – 16.00 WITA",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.768187803253!2d119.4184983152951!3d-5.141148896265733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbf1d5ff6a64497%3A0x2a71f33a9212a688!2sPantai%20Losari!5e0!3m2!1sid!2sid!4v1663242045551!5m2!1sid!2sid",
  facebookUrl: "https://facebook.com/koperasimp",
  instagramUrl: "https://instagram.com/koperasimp",
  twitterUrl: "https://twitter.com/koperasimp",
};

export default function ManajemenKontakPage() {
  const [formData, setFormData] = useState<InfoKontak>(mockInfoKontak);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Simulasi: Data kontak berhasil diperbarui!");
    console.log("Data yang disimpan:", formData);
    // Di sini nanti akan ada logika untuk mengirim data update ke API
  };

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Info Kontak & Lokasi"
        description="Perbarui informasi yang tampil di halaman kontak dan footer website."
      />
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 space-y-6">
          {/* --- Informasi Utama --- */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">Informasi Utama</legend>
            <div>
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><MapPin size={16}/> Alamat Lengkap</label>
              <textarea id="alamat" name="alamat" rows={3} value={formData.alamat} onChange={handleChange} className="w-full p-2 border rounded-lg"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telepon" className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Phone size={16}/> Nomor Telepon</label>
                <input id="telepon" name="telepon" type="text" value={formData.telepon} onChange={handleChange} className="w-full p-2 border rounded-lg"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Mail size={16}/> Alamat Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg"/>
              </div>
            </div>
             <div>
                <label htmlFor="jamOperasional" className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Clock size={16}/> Jam Operasional</label>
                <input id="jamOperasional" name="jamOperasional" type="text" value={formData.jamOperasional} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Contoh: Senin - Jumat, 08.00 - 16.00"/>
              </div>
          </fieldset>

          {/* --- Lokasi & Media Sosial --- */}
           <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">Lokasi & Media Sosial</legend>
            <div>
              <label htmlFor="googleMapsEmbed" className="block text-sm font-medium text-gray-600 mb-1">URL Embed Google Maps</label>
              <input id="googleMapsEmbed" name="googleMapsEmbed" type="text" value={formData.googleMapsEmbed} onChange={handleChange} className="w-full p-2 border rounded-lg font-mono text-xs"/>
              <p className="text-xs text-gray-500 mt-1">Salin URL dari opsi "Embed a map" di Google Maps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Facebook size={16}/> URL Facebook</label>
                <input id="facebookUrl" name="facebookUrl" type="text" value={formData.facebookUrl} onChange={handleChange} className="w-full p-2 border rounded-lg"/>
              </div>
              <div>
                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Instagram size={16}/> URL Instagram</label>
                <input id="instagramUrl" name="instagramUrl" type="text" value={formData.instagramUrl} onChange={handleChange} className="w-full p-2 border rounded-lg"/>
              </div>
              <div>
                <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2"><Twitter size={16}/> URL Twitter / X</label>
                <input id="twitterUrl" name="twitterUrl" type="text" value={formData.twitterUrl} onChange={handleChange} className="w-full p-2 border rounded-lg"/>
              </div>
            </div>
          </fieldset>

        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
            <Button type="submit" variant="primary">
                <Save size={18}/> Simpan Perubahan
            </Button>
        </div>
      </form>
    </div>
  );
}