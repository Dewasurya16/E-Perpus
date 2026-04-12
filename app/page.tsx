import { supabase } from '../lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ScanBukuModal from './dashboard/ScanBukuModal';
import QRCodeModal from './dashboard/QRCodeModal';
import AIAssistant from './AIAssistant';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicKatalogPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const isLoggedIn = !!session;

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans selection:bg-emerald-200">

      {/* ─── FONT IMPORT ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-float   { animation: float 6s ease-in-out infinite; }
        .anim-float-d { animation: float 6s ease-in-out infinite; animation-delay: 1.5s; }
        .anim-up-1 { animation: fadeSlideUp .7s ease both; }
        .anim-up-2 { animation: fadeSlideUp .7s .15s ease both; }
        .anim-up-3 { animation: fadeSlideUp .7s .3s ease both; }
        .anim-up-4 { animation: fadeSlideUp .7s .45s ease both; }

        .shimmer-text {
          background: linear-gradient(90deg, #fbbf24 0%, #fef3c7 40%, #f59e0b 60%, #fbbf24 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .card-hover {
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px -12px rgba(27,67,50,0.18);
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ─────────────────────────────────────────────────── */}
      {/* NAVBAR                                             */}
      {/* ─────────────────────────────────────────────────── */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-[#1B4332] rounded-xl shadow-lg shadow-emerald-900/30 rotate-3" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332] to-emerald-600 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
            </div>
            <div className="leading-none">
              <p className="text-[13px] font-bold text-slate-900 tracking-tight">E-Perpustakaan</p>
              <p className="text-[10px] font-semibold text-emerald-600 tracking-widest uppercase mt-0.5">Kejaksaan NegerI Soppeng</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {['Beranda', 'Koleksi', 'Layanan'].map((item, i) => (
              <Link
                key={item}
                href={i === 1 ? '#katalog' : i === 2 ? '#layanan' : '#'}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:text-[#1B4332] hover:bg-emerald-50 transition-all"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* CTA */}
          {isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-[#143628] transition-all shadow-md shadow-emerald-900/20 shrink-0">
              <span>🛡️</span> Dashboard
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#1B4332] text-[#1B4332] rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-50 transition-all shrink-0">
              <span>🔐</span> Login
            </Link>
          )}
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────── */}
      {/* HERO                                               */}
      {/* ─────────────────────────────────────────────────── */}
      <header className="relative bg-[#0f2a1c] overflow-hidden pt-24 pb-36">
        {/* Layered background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1B4332_0%,_transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#0a1f12_0%,_transparent_70%)]" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Decorative blobs */}
        <div className="anim-float absolute top-12 right-[8%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="anim-float-d absolute bottom-0 left-[5%] w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative book icons */}
        <div className="absolute right-16 top-20 opacity-10 text-[7rem] rotate-12 select-none hidden lg:block">📚</div>
        <div className="absolute right-40 bottom-10 opacity-10 text-[4rem] -rotate-6 select-none hidden lg:block">⚖️</div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="anim-up-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-[10px] font-bold uppercase tracking-[0.18em] mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Pusat Literasi & Referensi Hukum
            </div>

            {/* Headline */}
            <h2 className="anim-up-2 font-display text-[2.6rem] md:text-[3.6rem] text-white leading-[1.1] mb-6">
              Menjaga Lentera{' '}
              <span className="shimmer-text">Keadilan</span>
              <br />
              Lewat Pengetahuan.
            </h2>

            <p className="anim-up-3 text-emerald-100/70 font-medium max-w-xl text-[15px] leading-relaxed mb-10">
              Akses cepat & transparan ke ratusan literatur hukum, aset, dan dokumen referensi milik Kejaksaan Negeri Soppeng — tersedia untuk publik dan internal.
            </p>

            {/* Buttons */}
            <div className="anim-up-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="#katalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-[#1B4332] rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-[0_0_32px_rgba(251,191,36,0.35)] hover:shadow-[0_0_48px_rgba(251,191,36,0.45)] hover:-translate-y-1 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.35-4.35"/><circle cx="11" cy="11" r="8"/></svg>
                Eksplorasi Koleksi
              </Link>
              <Link
                href="#layanan"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/14 text-white border border-white/20 rounded-2xl text-[12px] font-bold uppercase tracking-widest backdrop-blur-md transition-all duration-300"
              >
                Info Layanan
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────── */}
      {/* STATS BANNER                                       */}
      {/* ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 relative z-20 -mt-16 mb-20">
        <div className="bg-white rounded-[1.75rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { value: `${books?.length ?? 0}+`, label: 'Total Koleksi', icon: '📖' },
              { value: '24/7', label: 'Akses Digital',   icon: '🌐' },
              { value: '100%', label: 'Publik & Transparan', icon: '✅' },
            ].map((s) => (
              <div key={s.label} className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left">
                <span className="text-2xl md:text-3xl mt-0.5 hidden md:block">{s.icon}</span>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 font-display leading-none">{s.value}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────── */}
      {/* LAYANAN                                            */}
      {/* ─────────────────────────────────────────────────── */}
      <section id="layanan" className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Apa yang Kami Tawarkan</span>
          <h3 className="font-display text-3xl md:text-4xl text-slate-900">Fasilitas & Layanan</h3>
          <div className="mt-4 flex gap-1">
            <div className="w-8 h-1 bg-amber-400 rounded-full" />
            <div className="w-3 h-1 bg-amber-200 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: '📱',
              color: 'emerald',
              title: 'Sistem QR Terpadu',
              desc: 'Scan QR Code pada fisik buku untuk melihat detail, histori, dan ketersediaan stok secara real-time langsung dari kamera HP Anda.',
            },
            {
              icon: '📚',
              color: 'amber',
              title: 'Ruang Baca Publik',
              desc: 'Tersedia ruang baca yang nyaman di area pelayanan terpadu untuk masyarakat yang ingin mencari referensi hukum di tempat.',
            },
            {
              icon: '🤝',
              color: 'blue',
              title: 'Peminjaman Internal',
              desc: 'Khusus pegawai kejaksaan terdaftar dapat melakukan peminjaman buku/aset secara digital untuk keperluan dinas.',
            },
          ].map((s) => (
            <div
              key={s.title}
              className="group bg-white rounded-[1.5rem] p-8 border border-slate-100 card-hover relative overflow-hidden"
            >
              {/* Subtle corner accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                s.color === 'emerald' ? 'bg-emerald-50' :
                s.color === 'amber'   ? 'bg-amber-50'   : 'bg-blue-50'
              }`} />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${
                s.color === 'emerald' ? 'bg-emerald-50' :
                s.color === 'amber'   ? 'bg-amber-50'   : 'bg-blue-50'
              } group-hover:scale-110 transition-transform duration-300`}>
                {s.icon}
              </div>
              <h4 className="font-bold text-slate-800 text-[16px] mb-3 leading-snug">{s.title}</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── */}
      {/* KATALOG                                            */}
      {/* ─────────────────────────────────────────────────── */}
      <main id="katalog" className="py-20 bg-gradient-to-b from-slate-100/60 to-slate-100 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-2 block">Koleksi Kami</span>
              <h3 className="font-display text-3xl md:text-4xl text-slate-900">Katalog Literatur Hukum</h3>
              <p className="text-[13px] text-slate-500 mt-2 font-medium">Daftar koleksi buku dan aset yang tersedia di perpustakaan.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-lg font-black text-[#1B4332] font-display">{books?.length ?? 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entri</span>
            </div>
          </div>

          {/* Book grid */}
          {books?.length === 0 ? (
            <div className="py-28 text-center border-2 border-dashed border-slate-300 rounded-[2rem] bg-white/50">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Katalog Sedang Kosong</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {books?.map((book) => (
                <div
                  key={book.id}
                  className="group bg-white rounded-[1.5rem] border border-slate-200/80 card-hover flex flex-col overflow-hidden relative"
                >
                  {/* Top color strip */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#1B4332] via-emerald-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Stock pill — positioned top-right */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      (book.stock ?? 0) > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(book.stock ?? 0) > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {(book.stock ?? 0) > 0 ? `${book.stock} Stok` : 'Habis'}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="flex-1 p-6 pt-5">
                    {/* Category */}
                    <span className="inline-block bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider mb-4">
                      {book.category || 'Umum'}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-[#1B4332] transition-colors">
                      {book.title}
                    </h3>

                    {/* Author */}
                    {book.author && (
                      <p className="text-[11px] text-slate-400 font-semibold mb-1 line-clamp-1">✍️ {book.author}</p>
                    )}

                    {/* Shelf location */}
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                      <span>📍</span>
                      Rak: <span className="text-slate-600 font-bold">{book.rak || '—'}</span>
                    </p>

                    {/* Rating */}
                    {book.rating && (
                      <div className="flex items-center gap-1 mt-3">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-[11px] ${s <= Math.round(book.rating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                        ))}
                        <span className="text-[10px] font-bold text-slate-400 ml-1">{Number(book.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Divider + CTA */}
                  <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                    <QRCodeModal book={book} isLoggedIn={isLoggedIn} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─────────────────────────────────────────────────── */}
      {/* FOOTER                                             */}
      {/* ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0a1f12] text-slate-400">
        {/* Top stripe */}
        <div className="h-1 bg-gradient-to-r from-[#1B4332] via-emerald-500 to-amber-400" />

        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-[#1B4332] rounded-xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <span className="text-white font-bold text-[13px]">E-Perpustakaan Kejaksaan Negeri Soppeng </span>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-500 max-w-xs">
              Sistem Informasi Manajemen Perpustakaan dan Aset Terpadu. Dibangun untuk mendukung transparansi akses literatur hukum.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white font-bold text-[12px] uppercase tracking-widest mb-5">Tautan</p>
            <ul className="space-y-3 text-[12px]">
              <li><Link href="/login"   className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="text-emerald-700">›</span> Portal Pegawai</Link></li>
              <li><Link href="#katalog" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="text-emerald-700">›</span> Katalog Publik</Link></li>
              <li><a  href="https://kejari-soppeng.kejaksaan.go.id/"          className="hover:text-emerald-400 transition-colors flex items-center gap-2"><span className="text-emerald-700">›</span> Situs Resmi Instansi</a></li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <p className="text-white font-bold text-[12px] uppercase tracking-widest mb-5">Jam Operasional</p>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Senin – Jumat</span>
                <span className="text-white font-semibold">08:00 – 16:00</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Sabtu – Minggu</span>
                <span className="text-red-400 font-semibold">Libur</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Akses Digital</span>
                <span className="text-emerald-400 font-semibold">24 Jam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 text-center text-[10px] text-slate-600 uppercase tracking-widest font-medium">
          &copy; {new Date().getFullYear()} Kejaksaan Negeri Soppeng · Kejaksaan RI · Hak Cipta Dilindungi
        </div>
      </footer>

      {/* ─── FLOATING BUTTONS ──────────────────────────────── */}
      <ScanBukuModal isLoggedIn={isLoggedIn} />
      <AIAssistant />

    </div>
  );
}