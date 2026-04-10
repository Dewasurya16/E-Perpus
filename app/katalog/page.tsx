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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KatalogPage(props: any) {
  // 1. AMBIL IDENTITAS LOGIN
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Pegawai';
  const userRole = session === 'admin' ? 'admin' : 'user';
  
  if (!session) redirect('/login'); 

  // 2. PARSE SEARCH PARAMS
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const filterCat = searchParams?.cat || ''; 
  const sortParam = searchParams?.sort || 'terbaru'; 

  // 3. QUERY DATABASE SUPABASE
  let supabaseQuery = supabase.from('books').select('*');
  
  if (query) { 
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%`); 
  }
  if (filterCat) {
    supabaseQuery = supabaseQuery.ilike('category', filterCat);
  }

  // Logika Sorting (Terbaru, Abjad, atau Stok)
  if (sortParam === 'abjad') {
    supabaseQuery = supabaseQuery.order('title', { ascending: true });
  } else if (sortParam === 'stok') {
    supabaseQuery = supabaseQuery.order('stock', { ascending: false });
  } else {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false }); 
  }

  const { data: books } = await supabaseQuery;

  // Ambil list kategori unik untuk filter
  const { data: allBooks } = await supabase.from('books').select('category');
  const uniqueCategories = Array.from(new Set(allBooks?.map(b => b.category).filter(Boolean)));
  
  // Label "Buku Baru" jika diinput dalam 7 hari terakhir
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 relative">
      
      {/* HEADER NAV */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1B4332] rounded-xl flex items-center justify-center shadow-lg text-white font-black text-xs">EP</div>
            <div className="flex flex-col">
               <h1 className="text-base font-black uppercase text-slate-800 leading-none">E-Perpus</h1>
               <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Kejaksaan RI</p>
            </div>
          </div>
          <ProfileMenu email={userEmail} role={userRole} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* HERO SECTION & SEARCH TOOLS */}
        <div className="mb-10 bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 mb-4 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">Pusat Referensi Digital</span>
              <h2 className="text-3xl sm:text-5xl font-black mb-2 tracking-tight">Katalog Aset Buku</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold">Cari dan pinjam literatur hukum untuk menunjang tugas kedinasan.</p>
            </div>
            
            <div className="flex w-full lg:max-w-[600px] items-center gap-3 mt-4 lg:mt-0">
              <div className="flex-1">
                <Suspense fallback={<div className="h-14 bg-white/5 rounded-2xl animate-pulse"></div>}>
                  <SearchBar />
                </Suspense>
              </div>
              <SortDropdown />
              <ScanBukuModal books={books || []} />
            </div>
          </div>

          {uniqueCategories.length > 0 && (
            <div className="mt-8">
               <CategoryFilter categories={uniqueCategories} />
            </div>
          )}
        </div>

        {/* GRID KATALOG BUKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {books?.map((book) => {
            const isNewBook = new Date(book.created_at).getTime() > sevenDaysAgo;

            return (
              <div key={book.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 relative">
                
                {isNewBook && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-amber-400 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">🔥 Baru</span>
                  </div>
                )}

                {/* Cover Placeholder */}
                <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center p-6 relative border-b border-slate-50">
                  <div className="w-24 h-36 bg-[#1B4332] rounded shadow-xl flex items-center justify-center p-3 text-center border-l-4 border-black/20 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-white text-[9px] font-black uppercase leading-tight italic line-clamp-3">{book.title}</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm border border-slate-100">
                    {book.stock}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex gap-2 mb-3">
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-widest">
                      Rak {book.rak || 'TBA'}
                    </span>
                  </div>

                  {/* BINTANG RATING DINAMIS */}
                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < Math.round(book.rating || 0) ? "text-amber-400" : "text-slate-200"}`}>★</span>
                    ))}
                    <span className="text-[9px] font-black text-slate-400 ml-1.5">({book.rating_count || 0} Ulasan)</span>
                  </div>

                  <h3 className="text-base font-black text-slate-800 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">{book.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-5">{book.author || 'Tim Kejaksaan'}</p>
                  
                  <div className="mt-auto space-y-2.5">
                    <BacaPDFModal url={book.pdf_url} />
                    
                    {/* 👇 SINKRONISASI EMAIL UNTUK PINJAM OTOMATIS 👇 */}
                    <BorrowModal book={book} userEmail={userEmail} /> 
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FEEDBACK JIKA KOSONG */}
        {books?.length === 0 && (
           <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 mt-10">
              <span className="text-4xl block mb-4">🔍</span>
              <h3 className="text-xl font-black text-slate-800">Aset Tidak Ditemukan</h3>
              <p className="text-sm text-slate-500 font-medium">Coba gunakan kata kunci lain atau hapus filter.</p>
           </div>
        )}

        {/* --- BAGIAN RIWAYAT PINJAMAN PEGAWAI (HISTORY) --- */}
        <div className="mt-20 border-t border-slate-200/60 pt-16">
           <MyHistory userEmail={userEmail} />
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}