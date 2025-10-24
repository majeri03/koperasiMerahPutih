// // frontend/app/dashboard/admin/layout.tsx
// "use client";

// import { useState, ReactNode, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import AdminSidebar from "@/components/AdminSidebar";
// import AdminHeader from "@/components/AdminHeader";
// // Import helper untuk token dan API profil/logout
// import { getAccessToken, apiGetProfile, apiLogout } from "@/lib/api";

// // Tipe sederhana untuk data profil
// interface UserProfile {
//   userId: string;
//   email: string;
//   role: string; // Akan berisi 'Pengurus' atau 'Anggota'
//   fullName?: string;
// }

// export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
//   const [isSidebarOpen, setSidebarOpen] = useState(false);
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true); // State loading
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State profil

//   // --- LOGIKA PERLINDUNGAN ROUTE & FETCH PROFIL ---
//   useEffect(() => {
//     const verifySession = async () => {
//       const token = getAccessToken(); // Cek token
//       if (!token) {
//         console.log("AdminLayout: No token found, redirecting to login...");
//         router.replace('/auth/login');
//         return;
//       }

//       try {
//         console.log("AdminLayout: Token found, fetching profile...");
//         const profile = await apiGetProfile(); // Panggil API profil
//         console.log("AdminLayout: Profile fetched:", profile);

//         // --- PENTING: Pengecekan Role untuk Admin ---
//         // Sesuaikan 'Pengurus' dengan nama role admin di backend Anda
//         if (profile.role !== 'Pengurus') {
//            console.warn("AdminLayout: Access denied. User role is not 'Pengurus'.");
//            throw new Error('Akses ditolak: Anda bukan Pengurus.'); // Lempar error untuk ditangkap di catch
//         }
//         // ---------------------------------------------

//         setUserProfile(profile); // Simpan profil jika role sesuai
//         setIsLoading(false); // Selesai loading
//       } catch (error: any) {
//         console.error("AdminLayout: Failed to fetch profile, token invalid, or role mismatch:", error);
//         apiLogout(); // Hapus token
//         // Redirect ke login, bisa tambahkan pesan error spesifik
//         router.replace(`/auth/login?error=${encodeURIComponent(error.message || 'Sesi tidak valid')}`);
//       }
//     };

//     verifySession();
//   }, [router]);

//   const toggleSidebar = () => {
//     setSidebarOpen(!isSidebarOpen);
//   };

//   // Tampilkan loading indicator
//   if (isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-gray-100">
//         <p>Memverifikasi sesi Anda...</p>
//       </div>
//     );
//   }
//   // --- AKHIR LOGIKA PERLINDUNGAN ---

//   // Tampilkan layout jika validasi berhasil
//   return (
//     <div className="flex h-screen bg-slate-50 overflow-hidden"> {/* */}
//       {/* Pass userProfile ke Sidebar jika perlu */}
//       <AdminSidebar
//         isSidebarOpen={isSidebarOpen}
//         toggleSidebar={toggleSidebar}
//         // userData={userProfile} // Contoh
//       /> {/* */}

//       <div className="flex-1 flex flex-col"> {/* */}
//         <AdminHeader
//           toggleSidebar={toggleSidebar}
//           // userData={userProfile} // Contoh
//         /> {/* */}
//         <main className="flex-1 p-6 md:p-8 overflow-y-auto"> {/* */}
//           {children} {/* */}
//         </main>
//       </div>
//     </div>
//   );
// }






"use client";

import { useState, ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    // PERUBAHAN 1: Tambahkan `h-screen` dan `overflow-hidden` pada div terluar
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader toggleSidebar={toggleSidebar} />
        {/* PERUBAHAN 2: Buat area <main> bisa di-scroll secara independen */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}