// frontend/app/page.tsx (File Sementara)

import Home from './(publik)/page';

// Komponen ini hanya untuk development, agar bisa diakses di localhost:3000
export default function TemporaryHomePage() {
  // Kita panggil komponen Home asli dengan parameter "dummy"
  return <Home params={{ tenant: 'development' }} />;
}