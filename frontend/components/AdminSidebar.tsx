// Lokasi: frontend/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users, BookUser, Shield, Landmark, HandCoins, Archive,
  FileText, Briefcase, BookOpen, MessageSquare, Mail,
  ClipboardList, Award, Building, LogOut, X,
  UserPlus, Globe, Settings, History, BookMarked,LayoutGrid,ClipboardCheck
} from "lucide-react";
import clsx from "clsx";

// --- Struktur data menu tidak berubah ---
const bukuKoperasiGroups = [
  {
    title: "Manajemen Utama",
    links: [
      { href: "/dashboard/admin", label: "Dashboard", icon: LayoutGrid },
      //{ href: "/dashboard/admin/persetujuan-koperasi", label: "Persetujuan Koperasi", icon: ClipboardCheck },
      { href: "/dashboard/admin/persetujuan-anggota", label: "Persetujuan Anggota", icon: UserPlus },
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
      { href: "/dashboard/admin/notulen-rapat-anggota", label: "Notulen Rapat Anggota", icon: FileText },
      { href: "/dashboard/admin/notulen-rapat-pengurus", label: "Notulen Rapat Pengurus", icon: FileText },
      { href: "/dashboard/admin/notulen-rapat-pengawas", label: "Notulen Rapat Pengawas", icon: FileText },
      { href: "/dashboard/admin/saran-anggota", label: "Saran Anggota", icon: MessageSquare },
      { href: "/dashboard/admin/saran-pengawas", label: "Saran Pengawas", icon: Award },
      { href: "/dashboard/admin/anjuran-pejabat", label: "Anjuran Pejabat", icon: Building },
      { href: "/dashboard/admin/catatan-kejadian", label: "Catatan Kejadian", icon: ClipboardList },
      { href: "/dashboard/admin/agenda-ekspedisi", label: "Agenda & Ekspedisi", icon: Mail },
    ]
  },
];

const aplikasiGroups = [
  {
    title: "Manajemen Website",
    links: [
        { href: "/dashboard/admin/website/berita", label: "Berita & Artikel", icon: FileText },
        { href: "/dashboard/admin/website/katalog", label: "Katalog Produk", icon: Landmark },
        { href: "/dashboard/admin/website/galeri", label: "Galeri Foto", icon: Users },
        { href: "/dashboard/admin/website/kontak", label: "Info Kontak", icon: Mail },
    ]
  },
  {
    title: "Sistem & Keamanan",
    links: [
        { href: "/dashboard/admin/sistem/log-audit", label: "Log Aktivitas", icon: History },
        { href: "/dashboard/admin/sistem/pengaturan", label: "Pengaturan Akun", icon: Settings },
    ]
  }
];

type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function AdminSidebar({ isSidebarOpen, toggleSidebar }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    console.log("Logout admin...");
    router.push('/auth/login');
  };

  const NavLink = ({ link }: { link: { href: string; label: string; icon: any } }) => {
    const isActive = pathname === link.href;
    const Icon = link.icon;
    return (
      <Link
        href={link.href}
        className={clsx(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm font-medium",
          {
            // Style untuk link aktif: Latar belakang putih, teks merah
            "bg-white text-brand-red-700 shadow": isActive,
            // Style untuk link tidak aktif: Teks putih, hover lebih cerah
            "text-red-100 hover:bg-white/20 hover:text-white": !isActive,
          }
        )}
      >
        <Icon size={18} />
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div
        onClick={toggleSidebar}
        className={clsx("fixed inset-0 bg-black/50 z-30 md:hidden", isSidebarOpen ? "block" : "hidden")}
      />

      <aside
        className={clsx(
          // --- PERUBAHAN UTAMA DI SINI ---
          // Latar belakang diubah kembali ke merah, teks ke putih
          "fixed inset-y-0 left-0 w-72 bg-brand-red-700 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header Sidebar */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold">Panel Pengurus</h2>
            <span className="text-sm text-red-200">Koperasi Digital</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden" aria-label="Tutup Menu">
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Navigasi Menu */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {/* Bagian Buku Koperasi */}
          <div className="space-y-4">
            <div className="px-3 flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-red-200" />
              <h3 className="text-sm font-bold uppercase text-red-100 tracking-wider">
                Buku Administrasi
              </h3>
            </div>
            {bukuKoperasiGroups.map((group) => (
              <div key={group.title}>
                <h4 className="px-3 mb-2 text-xs font-semibold uppercase text-red-200">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.links.map((link) => <NavLink key={link.href} link={link} />)}
                </div>
              </div>
            ))}
          </div>

          {/* Pemisah Visual */}
          <hr className="my-6 border-white/10" />

          {/* Bagian Aplikasi & Sistem */}
          <div className="space-y-4">
             <div className="px-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-red-200" />
              <h3 className="text-sm font-bold uppercase text-red-100 tracking-wider">
                Pengaturan katalog
              </h3>
            </div>
            {aplikasiGroups.map((group) => (
              <div key={group.title}>
                 <h4 className="px-3 mb-2 text-xs font-semibold uppercase text-red-200">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.links.map((link) => <NavLink key={link.href} link={link} />)}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-100 hover:bg-white/20 hover:text-white"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}