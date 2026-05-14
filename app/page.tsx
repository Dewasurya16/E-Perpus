import { supabase } from '../lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import ScanBukuModal from './dashboard/ScanBukuModal';
import AIAssistant from './AIAssistant';
import BookGrid from './Bookgrid';
import MobileNav from './Mobilenav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicKatalogPage() {
  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || '';
  const isLoggedIn = !!session;

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  const totalBooks = books?.length ?? 0;
  const availableBooks = books?.filter(b => b.stock > 0).length ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans selection:bg-emerald-200 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="glass-white relative z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-11 h-11 flex-shrink-0 transition-transform duration-400 group-hover:scale-105">
              <Image
                src="/images/logo-kejaksaan.png"
                alt="Logo Kejaksaan Negeri Soppeng"
                width={44} height={44}
                className="object-contain rounded-xl shadow-md bg-white border border-slate-100"
              />
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-black text-slate-900 tracking-tight group-hover:text-[var(--green-main)] transition-colors">E-Perpustakaan</p>
              <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Kejaksaan Negeri Soppeng</p>
            </div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { label: 'Beranda',   href: '#' },
              { label: 'Koleksi',   href: '#katalog' },
              { label: 'Layanan',   href: '#layanan' },
              { label: 'Buku Tamu', href: '/buku-tamu' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-[var(--green-main)] hover:bg-emerald-50/80 transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-[var(--green-main)] text-white rounded-xl text-[12px] font-black uppercase tracking-wider hover:bg-[var(--green-mid)] transition-all shadow-[var(--shadow-md)] hover:-translate-y-0.5 shrink-0 duration-300">
                <span>🛡️</span> Dashboard
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center gap-2 px-6 py-2.5 border-2 border-[var(--green-main)] text-[var(--green-main)] rounded-xl text-[12px] font-black uppercase tracking-wider hover:bg-emerald-50 hover:-translate-y-0.5 transition-all shrink-0 duration-300">
                <span>🔐</span> Login
              </Link>
            )}
            <MobileNav isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="relative bg-[#0f2a1c] overflow-hidden pt-24 sm:pt-32 pb-40 sm:pb-48">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1B4332_0%,_transparent_60%)] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#0a1f12_0%,_transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Animated blobs */}
        <div className="anim-blob absolute top-10 right-[5%] w-80 h-80 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="anim-blob-d absolute bottom-0 left-[3%] w-64 h-64 bg-amber-400/15 rounded-full blur-[60px] pointer-events-none" />
        <div className="anim-blob-d2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-900/30 rounded-full blur-[100px] pointer-events-none" />

        {/* Decorative elements (Watermarks) */}
        <div className="absolute right-12 top-24 opacity-[0.03] text-[12rem] font-black text-white leading-none pointer-events-none select-none hidden lg:block font-display">⚖</div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="anim-up-1 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-emerald-300 text-[10px] font-bold uppercase tracking-[0.18em] mb-8 border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-[pulseRing_2s_infinite]" />
              Sistem Informasi Manajemen Perpustakaan Terpadu
            </div>

            {/* Headline */}
            <h1 className="anim-up-2 font-display text-[2.5rem] sm:text-[3.5rem] md:text-[4.2rem] text-white leading-[1.1] mb-6 drop-shadow-lg">
              Menjaga Lentera{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-300">Keadilan</span>
              <br />
              Lewat Pengetahuan.
            </h1>

            <p className="anim-up-3 text-emerald-100/70 font-medium max-w-xl text-[15px] sm:text-[16px] leading-relaxed mb-10 drop-shadow-md">
              Akses digital dan transparan ke literatur hukum, aset, dan dokumen referensi milik Kejaksaan Negeri Soppeng. Terbuka untuk umum dan dikelola secara profesional.
            </p>

            <div className="anim-up-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="#katalog"
                className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-400 text-[var(--green-main)] rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-400 shadow-[var(--shadow-md)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.35-4.35"/><circle cx="11" cy="11" r="8"/></svg>
                Eksplorasi Koleksi
              </Link>
              <Link
                href="#layanan"
                className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 glass-dark text-white border border-white/20 rounded-2xl text-[13px] font-bold uppercase tracking-widest transition-all duration-400 hover:bg-white/10"
              >
                Info Layanan ↓
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--background)"/>
          </svg>
        </div>
      </header>

      {/* ── STATS BANNER ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-12 mb-20 sm:mb-24">
        <div className="bg-white rounded-[2rem] shadow-[var(--shadow-lg)] overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {[
              { value: `${totalBooks}+`,    label: 'Total Koleksi',       icon: '📖', delay: 100 },
              { value: `${availableBooks}`, label: 'Tersedia Dipinjam',   icon: '✅', delay: 200 },
              { value: '24/7',              label: 'Akses Digital',        icon: '🌐', delay: 300 },
            ].map((s) => (
              <div key={s.label} className={`reveal p-6 sm:p-8 md:p-10 flex flex-col items-center md:items-start gap-4 text-center md:text-left hover:bg-slate-50 transition-colors duration-300`} style={{ transitionDelay: `${s.delay}ms` }}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 border border-emerald-100/50 shadow-sm hidden md:flex">
                  {s.icon}
                </div>
                <div>
                  <p className="text-4xl md:text-5xl font-black text-slate-900 font-display leading-none mb-2">{s.value}</p>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Accent bar */}
          <div className="h-[4px] bg-gradient-to-r from-[var(--green-main)] via-emerald-400 to-amber-400" />
        </div>
      </div>

      {/* ── LAYANAN ── */}
      <section id="layanan" className="relative py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Background Decorative Patterns */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1B4332 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="anim-blob absolute top-0 left-[-10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="anim-blob-d absolute bottom-0 right-[-10%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Scattered Sharp Icons Background (Ramai dan Tajam) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Kiri */}
          <div className="anim-float absolute left-[3%] top-[5%] text-[2.5rem] text-emerald-600/20">✦</div>
          <div className="anim-float-d absolute left-[12%] top-[25%] text-[4rem] text-slate-800/10">⚖️</div>
          <div className="anim-float absolute left-[6%] top-[45%] text-[1.8rem] text-amber-500/20">＋</div>
          <div className="anim-float-d absolute left-[18%] top-[65%] text-[2rem] text-emerald-600/20">∘</div>
          <div className="anim-float absolute left-[4%] top-[80%] text-[3rem] text-blue-500/15">📖</div>
          <div className="anim-float-d absolute left-[22%] bottom-[5%] text-[2.5rem] text-slate-400/25">✧</div>

          {/* Tengah */}
          <div className="anim-float absolute left-[40%] top-[10%] text-[1.5rem] text-amber-500/30">∘</div>
          <div className="anim-float-d absolute left-[48%] top-[35%] text-[3rem] text-emerald-500/10">🏛️</div>
          <div className="anim-float absolute left-[35%] top-[70%] text-[2rem] text-slate-500/20">＋</div>
          <div className="anim-float-d absolute left-[55%] bottom-[15%] text-[2.5rem] text-blue-400/20">✦</div>
          <div className="anim-float absolute left-[45%] bottom-[2%] text-[1.5rem] text-emerald-600/30">✧</div>

          {/* Kanan */}
          <div className="anim-float-d absolute right-[8%] top-[10%] text-[3.5rem] text-slate-800/15">🏛️</div>
          <div className="anim-float absolute right-[15%] top-[30%] text-[2rem] text-emerald-500/25">✧</div>
          <div className="anim-float-d absolute right-[4%] top-[50%] text-[2.5rem] text-amber-500/20">✦</div>
          <div className="anim-float absolute right-[18%] top-[70%] text-[3.5rem] text-slate-800/10">🛡️</div>
          <div className="anim-float-d absolute right-[6%] bottom-[18%] text-[2.5rem] text-emerald-600/20">＋</div>
          <div className="anim-float absolute right-[12%] bottom-[5%] text-[1.8rem] text-blue-500/25">∘</div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center mb-16 sm:mb-20">
          <span className="reveal text-[11px] font-black text-emerald-600 uppercase tracking-[0.25em] mb-4 inline-flex items-center gap-3">
            <span className="w-6 h-px bg-emerald-400" /> Standar Pelayanan Terpadu <span className="w-6 h-px bg-emerald-400" />
          </span>
          <h2 className="reveal font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Fasilitas &amp; Layanan</h2>
          <div className="reveal mt-6 flex gap-2 items-center">
            <div className="w-10 h-1 bg-[var(--green-main)] rounded-full" />
            <div className="w-4 h-1 bg-amber-400 rounded-full" />
            <div className="w-2 h-1 bg-amber-200 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: '📱', color: 'from-emerald-500 to-emerald-400', num: '01',
              title: 'Sistem QR Dinamis',
              desc: 'Scan kode QR pada fisik buku untuk memverifikasi ketersediaan stok, meminjam, atau melacak riwayat penggunaan koleksi perpustakaan.',
              badge: 'Inovasi Digital',
            },
            {
              icon: '🏛️', color: 'from-amber-500 to-amber-400', num: '02',
              title: 'Ruang Baca Publik',
              desc: 'Fasilitas membaca dan diskusi yang nyaman bagi masyarakat luas, terintegrasi dengan area Pelayanan Terpadu Satu Pintu (PTSP).',
              badge: 'Terbuka untuk Umum',
            },
            {
              icon: '⚖️', color: 'from-blue-600 to-blue-400', num: '03',
              title: 'Akses Khusus Pegawai',
              desc: 'Integrasi peminjaman internal digital untuk mempermudah pegawai Kejaksaan dalam mencari referensi penyelesaian perkara atau dinas.',
              badge: 'Khusus Internal',
            },
          ].map((s, i) => (
            <div
              key={s.title}
              className="reveal group bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 card-hover relative overflow-hidden"
              style={{ transitionDelay: `${(i+1) * 150}ms` }}
            >
              {/* Number watermark */}
              <span className="absolute -top-4 -right-2 text-[6rem] font-black text-slate-50 select-none leading-none group-hover:text-emerald-50/60 transition-colors duration-400">
                {s.num}
              </span>
              
              {/* Icon watermark in card */}
              <span className="absolute -bottom-8 -right-8 text-[8rem] opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500">
                {s.icon}
              </span>
              
              {/* Accent top bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] bg-gradient-to-r ${s.color}`} />

              {/* Icon */}
              <div className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 transition-transform duration-400 group-hover:scale-110 group-hover:-rotate-6 bg-slate-50 border border-slate-100 shadow-sm">
                {s.icon}
              </div>

              <span className="relative z-10 inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 bg-slate-50 text-slate-600 border border-slate-200">
                {s.badge}
              </span>

              <h3 className="relative z-10 font-black text-slate-900 text-[18px] sm:text-[20px] mb-4 leading-snug group-hover:text-[var(--green-main)] transition-colors duration-300">{s.title}</h3>
              <p className="relative z-10 text-[14px] text-slate-500 leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="reveal animated-gradient-bg rounded-[2.5rem] p-10 sm:p-14 relative overflow-hidden shadow-[var(--shadow-green)]">
          <div className="anim-blob absolute -top-20 -right-20 w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-[80px]" />
          <div className="anim-blob-d absolute -bottom-10 -left-10 w-[300px] h-[300px] bg-amber-400/20 rounded-full blur-[60px]" />
          <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-[0.08] text-[10rem] leading-none font-black text-white select-none hidden md:block">⚖</div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-[pulseRing_2s_infinite]" />
                Asisten AI 24/7
              </span>
              <h3 className="font-display text-3xl sm:text-4xl text-white font-black leading-tight mb-4 drop-shadow-sm">
                Butuh Bantuan? Tanya <span className="shimmer-green">Lexi AI!</span>
              </h3>
              <p className="text-emerald-100/80 text-[15px] font-medium leading-relaxed">
                Asisten pintar perpustakaan siap membantu Anda mencari buku, meminjam langsung via chat, dan memberikan info seputar koleksi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              {!isLoggedIn && (
                <Link href="/login" className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[var(--green-main)] rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl">
                  🔐 Portal Pegawai
                </Link>
              )}
              <Link href="#katalog" className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 glass-dark text-white border border-white/20 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-white/10">
                📚 Jelajah Koleksi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── KATALOG ── */}
      <main id="katalog" className="relative py-20 sm:py-28 bg-slate-50 overflow-hidden border-t border-slate-200/50">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }} />
        <div className="anim-float absolute right-10 top-10 text-[6rem] opacity-[0.03] select-none pointer-events-none">🔍</div>
        <div className="anim-float-d absolute left-10 bottom-20 text-[8rem] opacity-[0.03] select-none pointer-events-none">📖</div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="reveal">
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.25em] mb-3 block">Direktori Buku</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 drop-shadow-sm tracking-tight">Katalog Literatur</h2>
              <p className="text-[15px] text-slate-500 mt-3 font-medium max-w-2xl">Daftar lengkap koleksi buku, dokumen perundang-undangan, dan pedoman dinas yang tersedia di perpustakaan kami.</p>
            </div>
            <div className="reveal flex items-center gap-4 px-6 py-4 bg-[#f8fafc] border border-slate-100 rounded-2xl shadow-sm shrink-0 card-hover-sm">
              <span className="text-3xl">📚</span>
              <div>
                <p className="text-3xl font-black text-[var(--green-main)] font-display leading-none">{totalBooks}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Koleksi</p>
              </div>
            </div>
          </div>

          <BookGrid books={books ?? []} isLoggedIn={isLoggedIn} />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a1f12] text-slate-400 relative overflow-hidden border-t-4 border-[var(--green-main)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1B4332_0%,_transparent_70%)] opacity-30" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 relative z-10">
          <div className="reveal">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 relative flex-shrink-0">
                <Image src="/images/logo-kejaksaan.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-white font-black text-[15px] leading-snug">E-Perpustakaan<br /><span className="text-emerald-500 font-bold text-[11px] uppercase tracking-widest">Kejaksaan Negeri Soppeng</span></span>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-400 max-w-sm font-medium">
              Sistem Informasi Manajemen Perpustakaan dan Aset Terpadu. Dibangun untuk mendukung transparansi akses literatur hukum.
            </p>
            <div className="flex gap-3 mt-8">
              {['📧', '📞', '🌐'].map((ico, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-emerald-900/50 hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-300 cursor-pointer shadow-sm">
                  {ico}
                </div>
              ))}
            </div>
          </div>

          <div className="reveal">
            <p className="text-white font-black text-[12px] uppercase tracking-[0.2em] mb-8">Tautan Cepat</p>
            <ul className="space-y-4 text-[14px] font-medium">
              {[
                { label: 'Portal Pegawai', href: '/login' },
                { label: 'Katalog Publik', href: '#katalog' },
                { label: 'Buku Tamu', href: '/buku-tamu' },
                { label: 'Situs Resmi Instansi', href: 'https://kejari-soppeng.kejaksaan.go.id/', ext: true },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 flex items-center gap-3 group">
                    <span className="text-emerald-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal">
            <p className="text-white font-black text-[12px] uppercase tracking-[0.2em] mb-8">Jam Operasional</p>
            <div className="space-y-4 text-[14px] font-medium">
              {[
                { day: 'Senin – Jumat',    time: '08:00 – 16:00',  cls: 'text-white' },
                { day: 'Sabtu – Minggu',   time: 'Libur',           cls: 'text-rose-400' },
                { day: 'Akses Digital',    time: '24 Jam',          cls: 'text-emerald-400' },
              ].map(r => (
                <div key={r.day} className="flex justify-between items-center border-b border-white/10 pb-4 last:border-0">
                  <span className="text-slate-400">{r.day}</span>
                  <span className={`font-bold ${r.cls}`}>{r.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-emerald-900/40 border border-emerald-800/50 rounded-xl text-[12px] text-emerald-300 flex items-center gap-3 shadow-inner">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-[pulseRing_2s_infinite] shrink-0" />
              Sistem aktif &amp; dapat diakses kapan saja
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-8 text-center text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold relative z-10 bg-black/20">
          &copy; {new Date().getFullYear()} Kejaksaan Negeri Soppeng · Pranata Komputer 625
        </div>
      </footer>

      <ScanBukuModal isLoggedIn={isLoggedIn} userEmail={userEmail} />
      <AIAssistant />
    </div>
  );
}