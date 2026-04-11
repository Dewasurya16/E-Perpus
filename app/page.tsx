import { supabase } from '../lib/supabase'; 
import { cookies } from 'next/headers';
import Link from 'next/link'; 
import ScanBukuModal from './dashboard/ScanBukuModal';
import QRCodeModal from './dashboard/QRCodeModal';
import AIAssistant from './AIAssistant';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicKatalogPage() {
  // 1. CEK STATUS LOGIN PENGUNJUNG
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const isLoggedIn = !!session; 

  // 2. TARIK DATA KATALOG BUKU
  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-200">
      
      {/* ========================================= */}
      {/* 1. NAVBAR RESMI & ELEGAN                  */}
      {/* ========================================= */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-[#0f2e22] to-[#1B4332] rounded-xl flex items-center justify-center shadow-lg shadow-[#1B4332]/20 border border-emerald-800">
              <span className="text-white font-black text-xs tracking-widest">RI</span>
            </div>
            <div>
              <h1 className="text-[15px] font-black uppercase tracking-tight text-slate-900 leading-none">E-Perpustakaan Hukum</h1>
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1">Kejaksaan Republik Indonesia</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <Link href="#" className="hover:text-[#1B4332] transition-colors">Beranda</Link>
            <Link href="#katalog" className="hover:text-[#1B4332] transition-colors">Koleksi</Link>
            <Link href="#layanan" className="hover:text-[#1B4332] transition-colors">Layanan</Link>
          </div>

          <div>
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-6 py-2.5 bg-[#1B4332] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#123023] transition-all shadow-md flex items-center gap-2">
                <span>🛡️</span> Dashboard Saya
              </Link>
            ) : (
              <Link href="/login" className="px-6 py-2.5 bg-white border-2 border-[#1B4332] text-[#1B4332] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2">
                <span>🔐</span> Login Pegawai
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* 2. HERO SECTION                           */}
      {/* ========================================= */}
      <header className="relative bg-[#1B4332] pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-amber-500 rounded-full blur-[100px] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-800/50 border border-emerald-600 text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            Pusat Literasi & Referensi Hukum
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Menjaga Lentera <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">Keadilan</span> <br className="hidden md:block"/> Melalui Pengetahuan.
          </h2>
          <p className="text-emerald-100/80 font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-10">
            Akses cepat dan transparan ke ratusan literatur hukum, aset, dan dokumen referensi milik Kejaksaan Republik Indonesia. Tersedia untuk publik dan internal.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="#katalog" className="px-8 py-4 bg-amber-400 text-[#1B4332] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:-translate-y-1">
              Eksplorasi Koleksi
            </Link>
            <Link href="#layanan" className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md">
              Info Layanan
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================= */}
      {/* 3. QUICK STATS                            */}
      {/* ========================================= */}
      <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-16 mb-16">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 flex flex-col md:flex-row justify-around gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="px-4">
            <h3 className="text-4xl font-black text-slate-800 mb-1">{books?.length || 0}+</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Koleksi Aset</p>
          </div>
          <div className="px-4 pt-6 md:pt-0">
            <h3 className="text-4xl font-black text-slate-800 mb-1">24/7</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akses Digital</p>
          </div>
          <div className="px-4 pt-6 md:pt-0">
            <h3 className="text-4xl font-black text-slate-800 mb-1">100%</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transparansi Publik</p>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4. LAYANAN PUBLIK                         */}
      {/* ========================================= */}
      <section id="layanan" className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Fasilitas & Layanan</h3>
          <div className="w-16 h-1 bg-amber-400 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all text-center group">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform">📱</div>
            <h4 className="font-black text-slate-800 mb-3">Sistem QR Terpadu</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Publik dapat melakukan scan QR Code pada fisik buku untuk melihat detail, histori, dan ketersediaan stok secara real-time.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all text-center group">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform">📚</div>
            <h4 className="font-black text-slate-800 mb-3">Ruang Baca Publik</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Tersedia ruang baca yang nyaman di area pelayanan terpadu untuk masyarakat yang ingin mencari referensi hukum di tempat.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all text-center group">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform">🤝</div>
            <h4 className="font-black text-slate-800 mb-3">Peminjaman Internal</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Khusus pegawai kejaksaan terdaftar dapat melakukan peminjaman buku/aset secara digital untuk dibawa pulang atau tugas dinas.</p>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* 5. KATALOG KOLEKSI UTAMA                  */}
      {/* ========================================= */}
      <main id="katalog" className="py-20 bg-slate-100/50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Katalog Literatur Hukum</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">Daftar koleksi buku dan aset yang tersedia di perpustakaan.</p>
            </div>
            <span className="px-4 py-2 bg-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-lg">
              Total {books?.length || 0} Entri
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books?.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-300 rounded-[2rem]">
                Katalog Sedang Kosong
              </div>
            ) : (
              books?.map((book) => (
                <div key={book.id} className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden">
                  
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1B4332] to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex-1 mb-6 mt-2">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                        {book.category || 'Umum'}
                      </span>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                        <span className="text-amber-400 text-[10px]">⭐</span>
                        <span className="text-[10px] font-black text-amber-700">{book.rating || '0.0'}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-black text-slate-800 text-[16px] leading-snug line-clamp-2 mb-2 group-hover:text-[#1B4332] transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <span>📍</span> Rak: {book.rak || 'TBA'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                     <QRCodeModal book={book} isLoggedIn={isLoggedIn} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ========================================= */}
      {/* 6. FOOTER RESMI INSTANSI                  */}
      {/* ========================================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t-4 border-[#1B4332]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-4">E-Perpustakaan</h4>
            <p className="text-xs leading-relaxed max-w-xs">
              Sistem Informasi Manajemen Perpustakaan dan Aset Terpadu. Dibangun untuk mendukung transparansi dan kemudahan akses literatur hukum.
            </p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-4">Tautan Penting</h4>
            <ul className="text-xs space-y-2">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Portal Pegawai (Login)</Link></li>
              <li><Link href="#katalog" className="hover:text-emerald-400 transition-colors">Daftar Koleksi Publik</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Situs Resmi Instansi</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-4">Jam Operasional</h4>
            <p className="text-xs leading-relaxed">
              <strong className="text-white">Senin - Jumat:</strong> 08:00 - 16:00 WITA<br/>
              <strong className="text-white">Sabtu - Minggu:</strong> Libur<br/>
              Akses Digital (E-Katalog) beroperasi 24 Jam.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-slate-800 text-center text-[10px] uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Pranata Komputer 625 - Kejaksaan RI. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
      
      {/* ========================================= */}
      {/* FLOATING BUTTONS                          */}
      {/* Scan QR — bottom-left                     */}
      {/* AI Chat  — bottom-right (dari AIAssistant)*/}
      {/* ========================================= */}
      <ScanBukuModal isLoggedIn={isLoggedIn} />
      <AIAssistant />

    </div>
  );
}