import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReactNode } from "react";

// Layout ini akan membungkus semua halaman di dalam folder (publik)
// seperti Beranda, Berita, Kontak, dan Auth.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}