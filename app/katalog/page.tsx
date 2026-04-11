import { supabase } from '../../lib/supabase';
import BorrowModal from './BorrowModal';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import CategoryFilter from './CategoryFilter';
import MyHistory from './History';
import AIAssistant from '../AIAssistant';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileMenu from '../ProfileMenu';
import BacaPDFModal from '../dashboard/BacaPDFModal';
import ScanBukuModal from '../dashboard/ScanBukuModal';
import QRCodeModal from '../dashboard/QRCodeModal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Warna cover otomatis berdasarkan kategori
const getCoverStyle = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('pidana'))    return { bg: 'from-rose-800 to-rose-950',     icon: '⚖️', accent: '#fca5a5' };
  if (cat.includes('perdata'))   return { bg: 'from-blue-800 to-blue-950',     icon: '📜', accent: '#93c5fd' };
  if (cat.includes('tata'))      return { bg: 'from-violet-800 to-violet-950', icon: '🏛️', accent: '#c4b5fd' };
  if (cat.includes('keuangan'))  return { bg: 'from-amber-700 to-amber-950',   icon: '💰', accent: '#fcd34d' };
  if (cat.includes('korupsi'))   return { bg: 'from-orange-700 to-orange-950', icon: '🔍', accent: '#fdba74' };
  if (cat.includes('ham'))       return { bg: 'from-teal-700 to-teal-950',     icon: '🤝', accent: '#5eead4' };
  if (cat.includes('pajak'))     return { bg: 'from-green-700 to-green-950',   icon: '📊', accent: '#86efac' };
  return { bg: 'from-[#1B4332] to-[#0a1f18]', icon: '📚', accent: '#6ee7b7' };
};

export default async function KatalogPage(props: any) {
  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Pegawai';
  const userRole  = session === 'admin' ? 'admin' : 'user';

  if (!session) redirect('/login');

  const searchParams = await props.searchParams;
  const query      = searchParams?.q   || '';
  const filterCat  = searchParams?.cat || '';
  const sortParam  = searchParams?.sort || 'terbaru';

  // ── Query buku ──
  let supabaseQuery = supabase.from('books').select('*');
  if (query)     supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
  if (filterCat) supabaseQuery = supabaseQuery.ilike('category', filterCat);

  if (sortParam === 'abjad') {
    supabaseQuery = supabaseQuery.order('title', { ascending: true });
  } else if (sortParam === 'stok') {
    supabaseQuery = supabaseQuery.order('stock', { ascending: false });
  } else {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  }

  const { data: books } = await supabaseQuery;

  // Stats
  const { data: allBooks } = await supabase.from('books').select('category, stock');
  const uniqueCategories = Array.from(
    new Set(allBooks?.map(b => b.category).filter(Boolean))
  ) as string[];
  const totalBooks    = allBooks?.length || 0;
  const tersediaBooks = allBooks?.filter(b => b.stock > 0).length || 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

  return (
    <div className="min-h-screen bg-[#F0F4F2] font-sans pb-32 relative">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-xl flex items-center justify-center shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase text-slate-900 leading-none tracking-tight">E-Perpus</h1>
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Kejaksaan Negeri Soppeng</p>
            </div>
          </div>
          <ProfileMenu email={userEmail} role={userRole} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8">

        {/* ── HERO ── */}
        <div className="mt-8 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="bg-[#1B4332] px-8 sm:px-14 pt-12 pb-8 relative">
            {/* Dekorasi */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-20 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute top-8 right-8 opacity-[0.04] text-[10rem] leading-none pointer-events-none select-none font-black">⚖</div>

            {/* Judul */}
            <div className="relative z-10 mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                Pusat Referensi Digital
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white leading-[0.9] tracking-tighter mb-4">
                Katalog<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-[#D4AF37]">Aset Buku</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium max-w-md">
                Temukan dan pinjam literatur hukum pilihan untuk menunjang tugas kedinasan.
              </p>
            </div>

            {/* Stats */}
            <div className="relative z-10 grid grid-cols-3 gap-3 mb-8 max-w-sm">
              {[
                { label: 'Total Koleksi', value: totalBooks },
                { label: 'Tersedia',      value: tersediaBooks },
                { label: 'Kategori',      value: uniqueCategories.length },
              ].map(s => (
                <div key={s.label} className="bg-white/8 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Search + Sort + Scan
                ★ FIX: SearchBar & SortDropdown menggunakan useSearchParams() 
                   sehingga WAJIB dibungkus <Suspense> masing-masing agar Next.js
                   tidak melempar hydration error dan filter bekerja dengan benar. */}
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <Suspense fallback={<div className="h-14 bg-white/5 rounded-2xl animate-pulse" />}>
                  <SearchBar />
                </Suspense>
              </div>
              <div className="flex items-center gap-3">
                {/* ★ FIX: SortDropdown juga butuh Suspense */}
                <Suspense fallback={<div className="h-14 w-[140px] bg-white/5 rounded-2xl animate-pulse" />}>
                  <SortDropdown />
                </Suspense>
                <ScanBukuModal isLoggedIn={true} />
              </div>
            </div>
          </div>

          {/* Filter strip — di luar hero utama supaya padding rapi
              ★ FIX: CategoryFilter pakai useSearchParams() → wajib Suspense */}
          {uniqueCategories.length > 0 && (
            <div className="bg-[#163a2c] px-8 sm:px-14 py-1">
              <Suspense fallback={<div className="h-12 bg-white/5 rounded-xl animate-pulse my-4" />}>
                <CategoryFilter categories={uniqueCategories} />
              </Suspense>
            </div>
          )}
        </div>

        {/* ── INFO BAR ── */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {books?.length || 0} buku ditemukan
            {query     && <span className="text-emerald-600"> · "{query}"</span>}
            {filterCat && <span className="text-emerald-600"> · {filterCat}</span>}
          </p>
        </div>

        {/* ── GRID KATALOG ── */}
        {books && books.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((book, idx) => {
              const isNew   = new Date(book.created_at).getTime() > sevenDaysAgo;
              const isHabis = book.stock === 0;
              const cover   = getCoverStyle(book.category);
              const ratingRounded = Math.round(book.rating || 0);

              return (
                <div
                  key={book.id}
                  className={`group relative bg-white rounded-[1.75rem] border shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    isHabis ? 'border-slate-200 opacity-75' : 'border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  {/* Badge Baru */}
                  {isNew && !isHabis && (
                    <div className="absolute top-3.5 left-3.5 z-20">
                      <span className="bg-[#D4AF37] text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg tracking-wider">
                        🔥 Baru
                      </span>
                    </div>
                  )}

                  {/* Overlay Stok Habis */}
                  {isHabis && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                      <span className="bg-slate-800 text-white text-[9px] font-black uppercase px-4 py-2 rounded-full shadow-lg tracking-widest">
                        Stok Habis
                      </span>
                    </div>
                  )}

                  {/* Cover Buku */}
                  <div className={`relative h-44 bg-gradient-to-br ${cover.bg} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute top-2 left-2 right-2 bottom-2 border border-white/10 rounded-2xl" />
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                      style={{ background: cover.accent, filter: 'blur(20px)' }}
                    />
                    {/* Simulasi buku */}
                    <div className="relative w-20 h-28 rounded-lg shadow-[4px_4px_16px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden group-hover:scale-105 transition-transform duration-500 bg-white/10 border border-white/20 backdrop-blur-sm">
                      <div className="h-1 w-full" style={{ background: cover.accent, opacity: 0.8 }} />
                      <div className="flex-1 flex flex-col items-center justify-center p-2 gap-1">
                        <span className="text-2xl">{cover.icon}</span>
                        <p className="text-white text-[7px] font-black uppercase text-center leading-tight line-clamp-3">
                          {book.title}
                        </p>
                      </div>
                    </div>
                    {/* Stok badge */}
                    <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                      {book.stock} pcs
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                      <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                        {book.category || 'Umum'}
                      </span>
                      {book.rak && (
                        <span className="text-[8px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          📍 Rak {book.rak}
                        </span>
                      )}
                    </div>

                    {/* Rating bintang */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
                          fill={i < ratingRounded ? '#F59E0B' : '#E2E8F0'}
                          className="flex-shrink-0">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                      <span className="text-[8px] text-slate-400 font-bold ml-1">
                        ({book.rating_count || 0})
                      </span>
                    </div>

                    <h3 className="text-[13px] font-black text-slate-800 line-clamp-2 leading-snug mb-1 group-hover:text-emerald-700 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mb-1 truncate">
                      {book.author || 'Tim Kejaksaan'}
                    </p>
                    {book.publisher && (
                      <p className="text-[9px] text-slate-300 font-medium mb-4 truncate">{book.publisher}</p>
                    )}

                    {/* Tombol Aksi */}
                    <div className="mt-auto space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <BacaPDFModal url={book.pdf_url} />
                        <QRCodeModal book={book} isLoggedIn={true} />
                      </div>
                      <BorrowModal book={book} userEmail={userEmail} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">🔍</div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Buku Tidak Ditemukan</h3>
            <p className="text-sm text-slate-400 font-medium">
              Coba gunakan kata kunci lain atau hapus filter kategori.
            </p>
          </div>
        )}

        {/* ── RIWAYAT PINJAMAN ── */}
        <div className="mt-20 pt-12 border-t-2 border-slate-200/60">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-[#1B4332] text-white rounded-xl flex items-center justify-center text-lg shadow-md">
              📋
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Riwayat Pinjaman Saya</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Kelola peminjaman aktif &amp; beri ulasan
              </p>
            </div>
          </div>
          <MyHistory userEmail={userEmail} />
        </div>

      </main>

      <AIAssistant />
    </div>
  );
}