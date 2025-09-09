import Button from "@/components/Button";
import Image from "next/image";
import Gallery, { GALLERY_IMAGES } from "@/components/Gallery";
import Link from "next/link";
import { fetchLatest } from "@/lib/news";
import NewsCard from "@/components/NewsCard";

export default async function Home() {
  const latest = await fetchLatest(3);
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center">
        <Image
        src="https://cdn.pixabay.com/photo/2023/05/04/02/24/bali-7969001_1280.jpg"
        alt="Koperasi"
        fill
        priority
        className="object-cover"
      />
        <div className="absolute inset-0 bg-gradient-to-b  to-white/95" />
        <div className="relative z-10 container px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white ">
            Koperasi Merah Putih
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto drop-shadow-2xl">
            Bersama membangun kesejahteraan anggota melalui simpanan, pinjaman,
            dan layanan koperasi modern.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button>Daftar Anggota</Button>
            <Button variant="outline">Lihat Berita</Button>
          </div>
        </div>
      </section>
      {/* 3 SEJARAH */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 space-y-6">
          <h2 className="text-2xl font-bold text-brand-red-600">Tentang Merah Putih</h2>
          <p className="text-gray-700">
            Koperasi Desa/Kelurahan Merah Putih dibentuk berdasarkan semangat Pasal 33 UUD 1945...
            Diluncurkan presiden RI pada 3 Maret 2025 dan resmi mulai Juli 2025 bertepatan Hari Koperasi Nasional.
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <blockquote className="border-l-4 border-brand-red-600 pl-4 italic text-gray-800">
              “Koperasi adalah alatnya orang lemah... Tapi kalau bersatu, mereka jadi kekuatan...” – Presiden Prabowo Subianto
            </blockquote>
          </div>
        </div>
      </section>

      {/* 3 FITUR */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow">
            <h3 className="text-xl font-bold text-brand-red-600">Simpanan</h3>
            <p className="mt-2 text-gray-600">
              Pantau saldo dan histori simpanan dengan transparan.
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow">
            <h3 className="text-xl font-bold text-brand-red-600">Pinjaman</h3>
            <p className="mt-2 text-gray-600">
              Ajukan pinjaman online, proses cepat dan terukur.
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow">
            <h3 className="text-xl font-bold text-brand-red-600">Katalog</h3>
            <p className="mt-2 text-gray-600">
              Jelajahi produk/jasa koperasi untuk anggota dan publik.
            </p>
          </div>
        </div>
      </section>
      {/* GALERI (preview 6 item) */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-red-600">Galeri</h2>
              <p className="text-gray-600">Cuplikan kegiatan & momen terbaik.</p>
            </div>
            <Link href="/galeri">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>

          <Gallery images={GALLERY_IMAGES} limit={6} />
        </div>
      </section>
      {/* Section Berita Terkini */}
      <section className="py-12 md:py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-red-600">
                Berita Terkini
              </h2>
              <p className="text-gray-600">Update terbaru seputar koperasi.</p>
            </div>
            <Link href="/berita">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
