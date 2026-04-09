import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans flex flex-col">
      
      {/* Navbar Minimalis */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1B4332] rounded flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">E-Perpus</span>
            </div>
            
            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/katalog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Katalog Koleksi</Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Dashboard Admin</Link>
            </div>
            
            {/* Action Button */}
            <div>
              <Link href="/katalog" className="bg-[#1B4332] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#122c21] transition-colors shadow-sm">
                Mulai Pinjam
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative overflow-hidden">
        {/* Aksen Background Halus */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-green-50 to-transparent opacity-50 blur-3xl -z-10 rounded-full"></div>

        <div className="text-center max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Sistem Digital Kejaksaan RI</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.1]">
            Ruang Literasi <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B4332] to-[#2D6A4F]">
              Pegawai Modern
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
            Akses cepat ke ribuan literatur hukum, undang-undang, dan modul pengembangan diri. Pinjam buku semudah menyentuh layar gawai Anda.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            <Link href="/katalog" className="bg-[#1B4332] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#122c21] transition-all shadow-lg hover:shadow-xl text-sm sm:text-base flex justify-center items-center gap-2">
              Jelajahi Katalog Buku
              <span>→</span>
            </Link>
            <Link href="/dashboard" className="bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm sm:text-base flex justify-center items-center">
              Akses Admin
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <div className="bg-white border-t border-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center sm:text-left">
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-5 mx-auto sm:mx-0 text-2xl">
                📚
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Koleksi Lengkap</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Dari KUHP hingga literatur teknologi, semua tercatat rapi dalam satu basis data terpusat.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-5 mx-auto sm:mx-0 text-2xl">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Proses Instan</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Tanpa antrean panjang. Pilih buku, isi form peminjaman dalam hitungan detik, dan bawa bukunya.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-5 mx-auto sm:mx-0 text-2xl">
                📊
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pantau Otomatis</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Sistem cerdas memantau ketersediaan stok dan tanggal jatuh tempo peminjaman secara otomatis.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} E-Perpus Kejaksaan RI. Dibangun dengan Next.js & Supabase.
          </p>
          <div className="text-xs text-gray-400 font-medium">
            Versi 1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}