"use client";
import React from 'react';
import Button from '@/components/ui/Button';

// Contoh data profil
const dataProfil = {
  nama: "Alviansyah Burhani",
  nomorAnggota: "AGT-00123",
  email: "alviansyah.b@email.com",
  noTelepon: "081234567890",
  alamat: "Jl. Kemerdekaan No. 45, Makassar",
  tanggalBergabung: "15 Januari 2024",
};

export default function HalamanProfil() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
        <Button variant="outline">Ubah Data</Button>
      </div>

      <div className="bg-white p-6 roSunded-xl shadow-lg border border-gray-100">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <span className="font-medium text-gray-500 col-span-1">Nama Lengkap</span>
            <span className="text-gray-800 col-span-2">{dataProfil.nama}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <span className="font-medium text-gray-500 col-span-1">Nomor Anggota</span>
            <span className="text-gray-800 col-span-2">{dataProfil.nomorAnggota}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <span className="font-medium text-gray-500 col-span-1">Email</span>
            <span className="text-gray-800 col-span-2">{dataProfil.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <span className="font-medium text-gray-500 col-span-1">No. Telepon</span>
            <span className="text-gray-800 col-span-2">{dataProfil.noTelepon}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <span className="font-medium text-gray-500 col-span-1">Alamat</span>
            <span className="text-gray-800 col-span-2">{dataProfil.alamat}</span>
          </div>
           <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <span className="font-medium text-gray-500 col-span-1">Tanggal Bergabung</span>
            <span className="text-gray-800 col-span-2">{dataProfil.tanggalBergabung}</span>
          </div>
        </div>
      </div>
    </div>
  );
}