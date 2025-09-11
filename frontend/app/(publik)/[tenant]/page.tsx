// src/app/(publik)/[tenant]/page.tsx
import Button from "@/components/ui/Button";
import Image from "next/image";
import Gallery, { GALLERY_IMAGES } from "@/components/public/Gallery";
import Link from "next/link";
import { fetchLatest } from "@/lib/news";
import NewsCard from "@/components/public/NewsCard";
import QuoteFader from "@/components/public/QuoteFader";

export default async function Home({ params }: { params: { tenant: string } }) {
  const { tenant } = params;
  const latest = await fetchLatest(3);

  return (
    <>
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <Image
          src="https://cdn.pixabay.com/photo/2023/05/04/02/24/bali-7969001_1280.jpg"
          alt="Koperasi"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-white/95" />
        <div className="relative z-10 container px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Koperasi Merah Putih
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto drop-shadow-2xl">
            Bersama membangun kesejahteraan anggota melalui simpanan, pinjaman,
            dan layanan koperasi modern.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {/* auth global + kirim tenant agar pendaftaran tahu koperasi mana */}
            <Link href={`/auth/register?tenant=${tenant}`}>
              <Button>Daftar Anggota</Button>
            </Link>
            <Link href={`/${tenant}/berita`}>
              <Button variant="outline">Lihat Berita</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 SEJARAH */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-80 lg:h-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://cdn.pixabay.com/photo/2024/06/18/21/37/bali-8838762_640.jpg"
                alt="Tentang Koperasi Merah Putih"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">
                Membangun Ekonomi Kerakyatan Berbasis Gotong Royong
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Koperasi Desa/Kelurahan Merah Putih dibentuk berdasarkan semangat Pasal 33 UUD 1945, sebagai fondasi untuk memperkuat ketahanan ekonomi rakyat. Diluncurkan secara resmi pada 3 Maret 2025, kami berkomitmen untuk menjadi motor penggerak kesejahteraan masyarakat.
              </p>
              <QuoteFader />
            </div>
          </div>
        </div>
      </section>

      {/* 3 FITUR */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          {/* ...card fitur... */}
        </div>
      </section>

      {/* GALERI */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-red-600">Galeri</h2>
              <p className="text-gray-600">Cuplikan kegiatan & momen terbaik.</p>
            </div>
            <Link href={`/${tenant}/galeri`}>
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>
          <Gallery images={GALLERY_IMAGES} limit={6} />
        </div>
      </section>

      {/* BERITA TERKINI */}
      <section className="py-12 md:py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-red-600">
                Berita Terkini
              </h2>
              <p className="text-gray-600">Update terbaru seputar koperasi.</p>
            </div>
            <Link href={`/${tenant}/berita`}>
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
