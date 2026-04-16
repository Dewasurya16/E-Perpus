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
import PaginationControls from './components/PaginationControls'; // <-- Import komponen Paginasi baru

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getCoverStyle = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('pidana'))   return { bg: 'from-rose-900 via-rose-800 to-red-950',       icon: '⚖️', accent: '#fca5a5',  stripe: '#be123c' };
  if (cat.includes('perdata'))  return { bg: 'from-blue-900 via-blue-800 to-indigo-950',     icon: '📜', accent: '#93c5fd',  stripe: '#1d4ed8' };
  if (cat.includes('tata'))     return { bg: 'from-violet-900 via-violet-800 to-purple-950', icon: '🏛️', accent: '#c4b5fd', stripe: '#7c3aed' };
  if (cat.includes('keuangan')) return { bg: 'from-amber-800 via-amber-700 to-yellow-950',   icon: '💰', accent: '#fcd34d',  stripe: '#d97706' };
  if (cat.includes('korupsi'))  return { bg: 'from-orange-800 via-orange-700 to-red-950',    icon: '🔍', accent: '#fdba74',  stripe: '#c2410c' };
  if (cat.includes('ham'))      return { bg: 'from-teal-800 via-teal-700 to-cyan-950',       icon: '🤝', accent: '#5eead4',  stripe: '#0f766e' };
  if (cat.includes('pajak'))    return { bg: 'from-green-800 via-green-700 to-emerald-950',  icon: '📊', accent: '#86efac',  stripe: '#15803d' };
  return { bg: 'from-[#1B4332] via-[#2D6A4F] to-[#0a1f18]', icon: '📚', accent: '#6ee7b7', stripe: '#065f46' };
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
  
  // === LOGIKA PAGINASI MULA ===
  const ITEMS_PER_PAGE = 12; // Jumlah buku per halaman
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // Gunakan { count: 'exact' } untuk mendapatkan total keseluruhan data
  let supabaseQuery = supabase.from('books').select('*', { count: 'exact' });
  
  if (query)     supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
  if (filterCat) supabaseQuery = supabaseQuery.ilike('category', filterCat);

 // Tambahkan .order('id') sebagai penentu mutlak jika ada data yang kembar
  if (sortParam === 'abjad') {
    supabaseQuery = supabaseQuery.order('title', { ascending: true }).order('id', { ascending: true });
  } else if (sortParam === 'stok') {
    supabaseQuery = supabaseQuery.order('stock', { ascending: false }).order('id', { ascending: true });
  } else {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false }).order('id', { ascending: true });
  }

  // Batasi data yang diambil sesuai halaman
  supabaseQuery = supabaseQuery.range(from, to);

  const { data: books, count } = await supabaseQuery;
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
  // === LOGIKA PAGINASI SELESAI ===

  // ✅ KODE BARU YANG SUPER RINGAN: HANYA MINTA ANGKA KE DATABASE
  const totalBooks = count || 0; // 'count' sudah kita dapat dari query utama di atas

  // 1. Hitung buku tersedia (Hanya minta angkanya saja ke database, tanpa menarik data buku)
  const { count: tersediaBooksCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .gt('stock', 0);
  const tersediaBooks = tersediaBooksCount || 0;

  // 2. Ambil daftar kategori (Hanya ambil nama kategori saja, jauh lebih ringan)
  const { data: catData } = await supabase.from('books').select('category');
  const uniqueCategories = Array.from(
    new Set(catData?.map(b => b.category).filter(Boolean))
  ) as string[];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

  return (
    <div className="min-h-screen bg-[#F3F6F4] font-sans pb-40 relative">

      {/* ── NOISE TEXTURE OVERLAY ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_1px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B4332] rounded-lg flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
            </div>
            <div className="leading-none">
              <span className="text-[13px] font-black text-slate-900 tracking-tight">E-Perpus</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-[10px] font-bold text-[#1B4332] uppercase tracking-widest">Kejari Soppeng</span>
            </div>
          </div>
          <ProfileMenu email={userEmail} role={userRole} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-10 relative z-10">

        {/* ── HERO ── */}
        <div className="mt-8 rounded-3xl overflow-hidden shadow-[0_8px_48px_rgba(27,67,50,0.22)]">
          <div className="bg-[#1B4332] px-8 sm:px-16 pt-14 pb-10 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-[480px] h-[480px] bg-emerald-500/10 rounded-full blur-[120px]" />
              <div className="absolute -bottom-10 left-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px]" />
              <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              <span className="absolute right-10 top-6 text-[120px] leading-none opacity-[0.035] font-black select-none text-white">⚖</span>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start lg:items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-white/8 border border-white/12 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">Pusat Referensi Digital</span>
                </div>
                <h2 className="text-5xl sm:text-[4.5rem] font-black text-white leading-[0.88] tracking-[-0.03em] mb-5">
                  Katalog<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-[#a8e6c1] to-[#D4AF37]">
                    Aset Buku
                  </span>
                </h2>
                <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
                  Temukan dan pinjam literatur hukum pilihan untuk menunjang tugas kedinasan Anda.
                </p>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                {[
                  { label: 'Koleksi',  value: totalBooks,      icon: '📚' },
                  { label: 'Tersedia', value: tersediaBooks,   icon: '✅' },
                  { label: 'Kategori', value: uniqueCategories.length, icon: '🗂️' },
                ].map(s => (
                 <div key={s.label} className="relative overflow-hidden bg-white/10 border border-white/10 rounded-2xl px-5 py-4 min-w-[80px] text-center">
                    <p className="text-xs mb-1.5">{s.icon}</p>
                    <p className="text-2xl font-black text-white tabular-nums">{s.value}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1">
                <Suspense fallback={<div className="h-[52px] bg-white/8 rounded-2xl animate-pulse" />}>
                  <SearchBar />
                </Suspense>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Suspense fallback={<div className="h-[52px] w-36 bg-white/8 rounded-2xl animate-pulse" />}>
                  <SortDropdown />
                </Suspense>
                <ScanBukuModal isLoggedIn={true} />
              </div>
            </div>
          </div>

          {uniqueCategories.length > 0 && (
            <div className="bg-[#163a2c] border-t border-white/5 px-8 sm:px-16 py-0.5">
              <Suspense fallback={<div className="h-10 bg-white/5 rounded-xl animate-pulse my-3" />}>
                <CategoryFilter categories={uniqueCategories} />
              </Suspense>
            </div>
          )}
        </div>

        {/* ── INFO BAR ── */}
        <div className="mt-7 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-4 rounded-full bg-[#1B4332]" />
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Menampilkan {books?.length || 0} dari {count || 0} buku
              {query     && <span className="text-emerald-600 font-black"> · "{query}"</span>}
              {filterCat && <span className="text-emerald-600 font-black"> · {filterCat}</span>}
            </p>
          </div>
        </div>

        {/* ── BOOK GRID ── */}
        {books && books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((book) => {
                const isNew        = new Date(book.created_at).getTime() > sevenDaysAgo;
                const isHabis      = book.stock === 0;
                const cover        = getCoverStyle(book.category);
                const ratingRounded = Math.round(book.rating || 0);

                return (
                  <div
                    key={book.id}
                    className={`group relative bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300
                    border shadow-sm hover:shadow-[0_8px_32px_rgba(27,67,50,0.14)] hover:-translate-y-1
                    ${isHabis
                      ? 'border-slate-200/60 opacity-70'
                      : 'border-slate-100 hover:border-emerald-200/60'
                    }`}
                  >
                    {isNew && !isHabis && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className="inline-flex items-center gap-1 bg-[#D4AF37] text-white text-[7px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg tracking-wider">
                          🔥 Baru
                        </span>
                      </div>
                    )}

                    {isHabis && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[3px]">
                        <span className="bg-slate-800 text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                          Stok Habis
                        </span>
                      </div>
                    )}

                    <div className={`relative h-44 bg-gradient-to-br ${cover.bg} overflow-hidden`}>
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: cover.stripe }} />
                      <div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-15 blur-2xl"
                        style={{ background: cover.accent }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-[68px] h-[92px] rounded-md shadow-[2px_4px_20px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden
                            group-hover:scale-105 group-hover:shadow-[4px_8px_28px_rgba(0,0,0,0.55)] transition-all duration-500
                            bg-white/20 border border-white/20"
                        >
                          <div className="h-1 w-full" style={{ background: cover.accent, opacity: 0.9 }} />
                          <div className="flex-1 flex flex-col items-center justify-center p-2 gap-1.5">
                            <span className="text-xl leading-none">{cover.icon}</span>
                            <p className="text-white text-[6px] font-black uppercase text-center leading-tight line-clamp-3 px-0.5">
                              {book.title}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-black/35 backdrop-blur-md border border-white/15 text-white text-[8px] font-bold px-2.5 py-1 rounded-full">
                        {book.stock} pcs
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        <span className="text-[7.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded uppercase tracking-widest">
                          {book.category || 'Umum'}
                        </span>
                        {book.rak && (
                          <span className="text-[7.5px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                            📍 Rak {book.rak}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 mb-2.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="10" height="10" viewBox="0 0 24 24"
                            fill={i < ratingRounded ? '#F59E0B' : '#E2E8F0'}
                            className="flex-shrink-0">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                        <span className="text-[7.5px] text-slate-400 font-bold ml-1">({book.rating_count || 0})</span>
                      </div>

                      <h3 className="text-[12.5px] font-black text-slate-800 line-clamp-2 leading-snug mb-1 group-hover:text-[#1B4332] transition-colors duration-200">
                        {book.title}
                      </h3>
                      <p className="text-[9.5px] text-slate-400 font-semibold mb-1 truncate">
                        {book.author || 'Tim Kejaksaan'}
                      </p>
                      {book.publisher && (
                        <p className="text-[8.5px] text-slate-300 font-medium truncate">{book.publisher}</p>
                      )}

                      <div className="my-3.5 border-t border-slate-100" />

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

            {/* ── PAGINATION CONTROLS ── */}
            <PaginationControls currentPage={currentPage} totalPages={totalPages} />

          </>
        ) : (
          <div className="mt-6 py-28 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl shadow-sm">
              🔍
            </div>
            <h3 className="text-base font-black text-slate-800 mb-2">Buku Tidak Ditemukan</h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              Coba gunakan kata kunci lain atau hapus filter kategori yang aktif.
            </p>
          </div>
        )}

        {/* ── HISTORY SECTION ── */}
        <div className="mt-24 pt-12 border-t-2 border-dashed border-slate-200/70">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#1B4332] text-white rounded-xl flex items-center justify-center text-base shadow-md flex-shrink-0">
              📋
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Riwayat Pinjaman Saya</h2>
              <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
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