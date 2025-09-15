// Lokasi: frontend/components/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
// 1. Impor useRouter
import { usePathname, useRouter } from "next/navigation"; 
import {
  Users, BookUser, Shield, Landmark, HandCoins, Archive,
  FileText, Briefcase, BookOpen, MessageSquare, Mail,
  ClipboardList, Calendar, Award, Building, LogOut, X, ChevronDown
} from "lucide-react";
import clsx from "clsx";

const navGroups = [
  // ... (isi navGroups tetap sama, tidak perlu diubah)
  {
    title: "Manajemen Utama",
    links: [
      { href: "/dashboard/admin/daftar-anggota", label: "Daftar Anggota", icon: Users },
      { href: "/dashboard/admin/daftar-pengurus", label: "Daftar Pengurus", icon: BookUser },
      { href: "/dashboard/admin/daftar-pengawas", label: "Daftar Pengawas", icon: Shield },
      { href: "/dashboard/admin/daftar-karyawan", label: "Daftar Karyawan", icon: Briefcase },
    ]
  },
  {
    title: "Keuangan",
    links: [
      { href: "/dashboard/admin/simpanan-anggota", label: "Simpanan Anggota", icon: Landmark },
      { href: "/dashboard/admin/pinjaman-anggota", label: "Pinjaman Anggota", icon: HandCoins },
    ]
  },
  {
    title: "Administrasi & Arsip",
    links: [
      { href: "/dashboard/admin/daftar-inventaris", label: "Daftar Inventaris", icon: Archive },
      { href: "/dashboard/admin/buku-tamu", label: "Buku Tamu", icon: BookOpen },
      { href: "/dashboard/admin/agenda-ekspedisi", label: "Agenda & Ekspedisi", icon: Mail },
    ]
  },
  {
    title: "Notulensi & Laporan",
    links: [
      { href: "/dashboard/admin/notulen-rapat-anggota", label: "Notulen Rapat Anggota", icon: FileText },
      { href: "/dashboard/admin/notulen-rapat-pengurus", label: "Notulen Rapat Pengurus", icon: FileText },
      { href: "/dashboard/admin/notulen-rapat-pengawas", label: "Notulen Rapat Pengawas", icon: FileText },
      { href: "/dashboard/admin/saran-anggota", label: "Saran Anggota", icon: MessageSquare },
      { href: "/dashboard/admin/saran-pengawas", label: "Saran Pengawas", icon: Award },
      { href: "/dashboard/admin/anjuran-pejabat", label: "Anjuran Pejabat", icon: Building },
      { href: "/dashboard/admin/catatan-kejadian", label: "Catatan Kejadian", icon: ClipboardList },
    ]
  }
];

type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function AdminSidebar({ isSidebarOpen, toggleSidebar }: Props) {
  const pathname = usePathname();
  // 2. Inisialisasi router
  const router = useRouter(); 

  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    for (const group of navGroups) {
      if (group.links.some(link => pathname.startsWith(link.href))) {
        return group.title;
      }
    }
    return null;
  });

  const handleGroupClick = (title: string) => {
    setOpenGroup(prevOpenGroup => (prevOpenGroup === title ? null : title));
  };

  // 3. Lengkapi fungsi handleLogout
  const handleLogout = () => {
    console.log("Logout admin...");
    // Arahkan pengguna ke halaman login
    router.push('/auth/login'); 
  };

  return (
    <>
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 w-72 bg-brand-red-700 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ... (Header Sidebar tidak berubah) ... */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold">Panel Pengurus</h2>
            <span className="text-sm text-red-200">Koperasi Digital</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden" aria-label="Tutup Menu">
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        {/* ... (Navigasi Grup tidak berubah) ... */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {navGroups.map((group) => {
            const isGroupOpen = openGroup === group.title;
            return (
              <div key={group.title}>
                <button
                  onClick={() => handleGroupClick(group.title)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10"
                >
                  <span className="text-sm font-bold text-red-200 uppercase tracking-wider">
                    {group.title}
                  </span>
                  <ChevronDown
                    className={clsx(
                      "h-5 w-5 text-red-200 transition-transform",
                      isGroupOpen && "transform rotate-180"
                    )}
                  />
                </button>
                {isGroupOpen && (
                  <div className="pt-1 pb-2 pl-4 space-y-1 border-l-2 border-red-500/50 ml-4">
                    {group.links.map((link) => {
                      const isActive = pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={clsx(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm",
                            {
                              "bg-white text-brand-red-700 font-semibold": isActive,
                              "text-white/80 hover:bg-white/20": !isActive,
                            }
                          )}
                        >
                          <link.icon size={18} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        {/* Tombol Logout sekarang akan berfungsi */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-2 text-white/80 hover:bg-white/20"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}