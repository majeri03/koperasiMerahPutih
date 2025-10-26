// frontend/app/dashboard/admin/layout.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/token";
// --- PERBAIKI IMPORT DI SINI ---
import { JwtPayload, ApiErrorResponse } from "@/types/api.types"; // Hapus Role dari sini
import { Role } from "@/types/enums"; // <-- Import Role dari enums.ts
// --- SELESAI PERBAIKAN IMPORT ---
import { useAuthSync } from '@/lib/hooks/useAuthSync';

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useAuthSync();

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await authService.getProfile();
        // --- ERROR 'Cannot find name Role' AKAN HILANG SETELAH IMPORT DIPERBAIKI ---
        if (profile.role !== Role.Pengurus && profile.role !== Role.Pengawas) {
           console.warn(`Akses ditolak: Pengguna ${profile.email} (${profile.role}) mencoba mengakses dashboard admin.`);
           authService.logout();
           return;
        }
        setUserData(profile);
      } catch (err) {
        const error = err as ApiErrorResponse;
        console.error("Gagal memuat profil admin:", error.message);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile().catch(console.error);

  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat dashboard admin...</div>;
  }

  // --- ERROR 'Cannot find name Role' AKAN HILANG SETELAH IMPORT DIPERBAIKI ---
   if (!userData || (userData.role !== Role.Pengurus && userData.role !== Role.Pengawas)) {
      return null;
   }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        userData={userData} // <-- Kirim prop userData
      />
      <div className="flex-1 flex flex-col">
        <AdminHeader
          toggleSidebar={toggleSidebar}
          userData={userData} // <-- Kirim prop userData
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}