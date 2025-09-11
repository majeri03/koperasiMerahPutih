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
    <div className="flex min-h-screen bg-slate-50">
      <AnggotaSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col">
        <AnggotaHeader toggleSidebar={toggleSidebar} />
        {/* Konten halaman (page.tsx) akan dirender di sini */}
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
