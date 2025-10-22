import Button from "@/components/Button";
import Image from "next/image";
import Gallery, { GALLERY_IMAGES } from "@/components/Gallery";
import Link from "next/link";
import { fetchLatest } from "@/lib/news";
import NewsCard from "@/components/NewsCard";
import QuoteFader from "@/components/QuoteFader";
import ProductCard from "@/components/ProductCard";
import { fetchFeaturedProducts } from "@/lib/products";


export default async function Home() {
  const latest = await fetchLatest(3);
  const featuredProducts = await fetchFeaturedProducts(4);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <Image
          src="https://cdn.pixabay.com/photo/2023/05/04/02/24/bali-7969001_1280.jpg"
          alt="Koperasi"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
            Koperasi Merah Putih
          </h1>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Bersama membangun kesejahteraan anggota melalui simpanan, pinjaman,
            dan layanan koperasi modern.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/login">
              <Button>Daftar Anggota</Button>
            </Link>
            <Link href="/berita">
              <Button variant="outline">Lihat Berita</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SEJARAH SECTION */}
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
                Koperasi Desa/Kelurahan Merah Putih dibentuk berdasarkan semangat Pasal 33 UUD 1945, sebagai fondasi untuk memperkuat ketahanan ekonomi rakyat.
              </p>
              <QuoteFader />
            </div>
          </div>
        </div>
      </section>

      {/* FITUR SECTION */}
      <section className="py-12 md:py-16 bg-gray-50 border-y">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-brand-red-600">Simpanan</h3>
            <p className="mt-2 text-gray-600">
              Pantau saldo dan histori simpanan dengan transparan.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-brand-red-600">Pinjaman</h3>
            <p className="mt-2 text-gray-600">
              Ajukan pinjaman online, proses cepat dan terukur.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-brand-red-600">Katalog</h3>
            <p className="mt-2 text-gray-600">
              Jelajahi produk/jasa koperasi untuk anggota dan publik.
            </p>
          </div>
        </div>
      </section>

      {/* GALERI PREVIEW SECTION */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-red-600">Galeri Kegiatan</h2>
              <p className="text-gray-600 mt-1">Cuplikan momen terbaik dari kegiatan kami.</p>
            </div>
            <Link href="/galeri" className="hidden sm:inline-block">
                <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>
          <Gallery images={GALLERY_IMAGES} limit={6} />
        </div>
      </section>

      {/* BERITA TERKINI SECTION */}
      <section className="py-12 md:py-16 bg-red-50/50 border-t">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-red-600">
                Berita Terkini
              </h2>
              <p className="text-gray-600 mt-1">Update terbaru seputar kegiatan dan layanan koperasi.</p>
            </div>
            <Link href="/berita" className="hidden sm:inline-block">
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
      <section className="py-12 md:py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-red-600">
                Produk Unggulan
              </h2>
              <p className="text-gray-600 mt-1">Jelajahi produk dan layanan terbaik kami.</p>
            </div>
            <Link href="/katalog" className="hidden sm:inline-block">
                <Button variant="outline">Lihat Semua Produk</Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((produk) => (
              <ProductCard key={produk.id} produk={produk} />
            ))}
            {featuredProducts.length === 0 && (
              <p className="sm:col-span-2 lg:col-span-4 text-center text-gray-500">
                Belum ada produk unggulan yang tersedia saat ini.
              </p>
            )}
          </div>
        </div>
      </section>

{/* SEKSI CALL TO ACTION BARU (GABUNGAN) */}
<section className="bg-slate-100 border-y">
  <div className="container mx-auto px-4 py-16 md:py-20">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

      {/* Kolom Kiri: Teks dan Tombol Aksi */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold text-brand-red-600 leading-tight">
          Mari Bangun Negeri Dengan Jadi Bagian Dari Koperasi
        </h2>
        <p className="mt-4 text-gray-600 max-w-lg mx-auto md:mx-0">
          Wujudkan Koperasi Modern yang transparan, efisien, dan mensejahterakan Anggota.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
          <Link href="/auth/daftar-koperasi">
            <Button variant="outline" className="w-full sm:w-auto">Daftarkan Koperasi Anda</Button>
          </Link>
          <Link href="/auth/daftar-anggota">
            <Button className="w-full sm:w-auto">Bergabung Menjadi Anggota Koperasi</Button>
          </Link>
        </div>
      </div>

      {/* Kolom Kanan: Gambar dengan Efek Fade */}
      <div className="relative hidden h-[350px] w-full md:flex justify-center items-end">
        <Image
            src="/images/merahputih-rmv.png"
            alt="Anak-anak Indonesia membawa bendera"
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-lg"
        />
        {/* EFEK ASAP/FADE DITAMBAHKAN DI SINI */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent" />
      </div>

    </div>
  </div>
</section>

    </>
  );
}