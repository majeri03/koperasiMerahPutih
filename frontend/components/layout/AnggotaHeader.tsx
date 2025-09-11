"use client";

import { Menu } from "lucide-react";

type Props = {
  toggleSidebar: () => void;
};

export default function AnggotaHeader({ toggleSidebar }: Props) {
  return (
    // Header ini hanya akan muncul di layar di bawah medium (md)
    <header className="md:hidden sticky top-0 z-30 bg-white shadow">
      <div className="container mx-auto flex items-center justify-between p-4">
        <p className="text-lg font-bold text-brand-red-700">Menu Anggota</p>
        <button onClick={toggleSidebar} aria-label="Buka Menu">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}