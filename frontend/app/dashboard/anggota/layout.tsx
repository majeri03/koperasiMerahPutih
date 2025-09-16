"use client"; // Diperlukan karena menggunakan state untuk sidebar

import { useState, ReactNode } from "react";
import AnggotaSidebar from "@/components/AnggotaSidebar";
import AnggotaHeader from "@/components/AnggotaHeader";

export default function AnggotaDashboardLayout({ children }: { children: ReactNode }) {
  // State untuk mengontrol visibilitas sidebar di mode mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    // PERUBAHAN 1: Tambahkan `h-screen` dan `overflow-hidden` pada div terluar
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AnggotaSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col">
        <AnggotaHeader toggleSidebar={toggleSidebar} />
        {/* PERUBAHAN 2: Buat area <main> bisa di-scroll secara independen */}
        <main className="p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}  
