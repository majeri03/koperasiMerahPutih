"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PiggyBank, CreditCard, User, LogOut, X } from "lucide-react";
import clsx from "clsx";

// PERBAIKAN 1: Pastikan link ini sesuai dengan struktur folder Anda
const navLinks = [
  { href: "/dashboard/anggota", label: "Dashboard", icon: Home },
  { href: "/dashboard/anggota/simpanan", label: "Simpanan", icon: PiggyBank },
  { href: "/dashboard/anggota/pinjaman", label: "Pinjaman", icon: CreditCard },
  { href: "/dashboard/anggota/profile", label: "Profil Saya", icon: User },
];

type Props = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export default function AnggotaSidebar({ isSidebarOpen, toggleSidebar }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    console.log("Proses logout dijalankan...");
    router.push("/auth/login"); // Arahkan ke halaman login publik
  };

  return (
    <>
      {/* Backdrop untuk mobile, klik untuk menutup */}
      <div
        onClick={toggleSidebar}
        className={clsx(
          "fixed inset-0 bg-black/50 z-30 md:hidden",
          isSidebarOpen ? "block" : "hidden"
        )}
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 w-64 bg-brand-red-700 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold">Koperasi Digital</h2>
            <span className="text-sm text-red-200">Anggota Panel</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden" aria-label="Tutup Menu">
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            // Cek apakah link saat ini aktif
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => isSidebarOpen && toggleSidebar()} // Tutup sidebar saat link diklik di mobile
                // PERBAIKAN 2: Logika className diubah agar lebih jelas
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-2 transition-all",
                  {
                    "bg-white text-brand-red-700 font-semibold": isActive, // Style untuk link aktif
                    "text-white/80 hover:bg-white/20": !isActive, // Style untuk link tidak aktif
                  }
                )}
              >
                <link.icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>
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