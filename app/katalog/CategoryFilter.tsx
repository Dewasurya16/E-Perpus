'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mengambil kategori yang sedang aktif dari URL
  const currentCat = searchParams.get('cat') || '';

  const handleFilter = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('cat', cat);
    } else {
      params.delete('cat'); // Jika pilih "Semua", hapus filter
    }
    // Update URL dan paksa halaman memuat data baru
    router.push(`?${params.toString()}`);
  };

  // Gaya untuk tombol yang sedang AKTIF (Bercahaya)
  const activeStyle = "bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(52,211,153,0.6)] border border-emerald-300";
  // Gaya untuk tombol MATI
  const inactiveStyle = "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10";

  return (
    <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
        Klasifikasi:
      </span>
      
      <button 
        onClick={() => handleFilter('')} 
        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${!currentCat ? activeStyle : inactiveStyle}`}
      >
        Semua
      </button>
      
      {categories.map(cat => (
        <button 
          key={cat} 
          onClick={() => handleFilter(cat)} 
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${currentCat === cat ? activeStyle : inactiveStyle}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}