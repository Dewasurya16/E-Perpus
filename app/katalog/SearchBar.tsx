'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set('q', searchTerm);
        params.delete('page'); // <--- TAMBAHKAN INI: Reset ke hal 1 saat cari
      } else {
        params.delete('q');
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="relative w-full flex-1 group">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
        <span className="text-emerald-400 text-lg">🔍</span>
      </div>
      <input
        type="text"
        placeholder="Cari referensi, aturan, dsb..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-6 h-14 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-emerald-100/50 rounded-2xl focus:bg-white/20 focus:ring-2 focus:ring-emerald-400 outline-none transition-all font-bold text-sm shadow-inner"
      />
    </div>
  );
}