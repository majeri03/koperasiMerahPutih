import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export const metadata: Metadata = {
  title: "Koperasi Merah Putih",
  description: "Platform koperasi modern: simpanan, pinjaman, katalog, dan informasi.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Koperasi Merah Putih",
    description: "Platform koperasi modern.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
