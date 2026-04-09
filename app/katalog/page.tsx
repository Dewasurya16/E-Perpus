import { supabase } from '../../lib/supabase';
import BorrowModal from './BorrowModal';
import SearchBar from './SearchBar';
import MyHistory from './History'; 
import AIAssistant from '../AIAssistant';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileMenu from '../ProfileMenu'; 

// === IMPORT FITUR BARU ===
import BacaPDFModal from '../dashboard/BacaPDFModal';
import ScanBukuModal from '../dashboard/ScanBukuModal';

export const revalidate = 0;

export default async function KatalogPage(props: any) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Pegawai';
  const userRole = session === 'admin' ? 'admin' : 'user';
  
  if (!session) redirect('/login'); 

  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';

  let supabaseQuery = supabase.from('books').select('*').order('created_at', { ascending: false });
  if (query) { 
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%`); 
  }
  const { data: books } = await supabaseQuery;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans pb-20 transition-all relative">
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1B4332] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-black text-[10px] sm:text-xs">EP</span>
            </div>
            <div className="flex flex-col">
               <h1 className="text-sm sm:text-base font-bold uppercase tracking-tight leading-none">E-Perpus</h1>
               <p className="text-[9px] font-bold text-emerald-600 hidden sm:block uppercase tracking-widest mt-1">Kejaksaan RI</p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0">
            <ProfileMenu email={userEmail} role={userRole} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        
        {/* BANNER & PENCARIAN */}
        <div className="mb-8 sm:mb-12 bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1B4332] mb-1 tracking-tight">Katalog Referensi</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-bold tracking-wide uppercase">Cari buku fisik atau baca versi digital</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse rounded-2xl w-full md:w-80"></div>}>
                <SearchBar />
              </Suspense>
              {/* SCANNER DI SAMPING SEARCH */}
              <ScanBukuModal books={books || []} />
            </div>
          </div>
        </div>

        {/* GRID DAFTAR BUKU - Perbaikan Grid Gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {books?.map((book) => (
            <div key={book.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full">
              
              {/* Cover Area - Rasio Tetap */}
              <div className="aspect-[4/3] sm:aspect-[3/4] bg-slate-50 flex items-center justify-center p-6 border-b border-slate-50 relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-50"></div>
                <div className="w-24 h-36 sm:w-28 sm:h-40 bg-[#1B4332] rounded-xl shadow-2xl flex items-center justify-center p-4 text-center transform group-hover:rotate-2 group-hover:scale-110 transition-transform duration-500 relative z-10 border-l-8 border-black/10">
                  <span className="text-white text-[10px] sm:text-xs font-black uppercase leading-tight line-clamp-4 italic tracking-tighter">
                    {book.title}
                  </span>
                </div>
              </div>

              {/* Info Area - Flex Grow agar tombol selalu di bawah */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider">
                      {book.category}
                    </span>
                    <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 uppercase">
                      📍 Rak {book.rak || 'TBA'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-[#1B4332] transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-bold italic uppercase tracking-tight">
                    Oleh: {book.author || 'Tim Kejaksaan'}
                  </p>
                </div>
                
                {/* Tombol Aksi - Rapi & Sejajar */}
                <div className="mt-auto pt-4 space-y-2 border-t border-slate-50">
                  <div className="w-full">
                    <BacaPDFModal url={book.pdf_url} />
                  </div>
                  <BorrowModal book={book} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIWAYAT */}
        <div className="mt-20 sm:mt-32 border-t border-gray-200 pt-16">
          <MyHistory userEmail={userEmail} />
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}