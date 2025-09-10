import { Banknote, HandCoins, CalendarClock } from "lucide-react";

export default function AnggotaDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, [Nama Anggota]!</h1>
      <p className="mt-2 text-gray-600">Berikut adalah ringkasan akun koperasi Anda.</p>

      {/* Kartu Ringkasan dengan Ikon */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Kartu Total Simpanan */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center gap-5">
          <div className="p-3 bg-green-100 rounded-full">
            <HandCoins className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Simpanan</h3>
            <p className="mt-1 text-2xl font-bold text-gray-800">Rp 5.750.000</p>
          </div>
        </div>

        {/* Kartu Pinjaman Aktif */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center gap-5">
          <div className="p-3 bg-red-100 rounded-full">
            <Banknote className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pinjaman Aktif</h3>
            <p className="mt-1 text-2xl font-bold text-gray-800">Rp 1.200.000</p>
          </div>
        </div>

        {/* Kartu Jatuh Tempo */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center gap-5">
          <div className="p-3 bg-blue-100 rounded-full">
            <CalendarClock className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Jatuh Tempo Berikutnya</h3>
            <p className="mt-1 text-2xl font-bold text-gray-800">25 Sep 2025</p>
          </div>
        </div>

      </div>
    </div>
  );
}