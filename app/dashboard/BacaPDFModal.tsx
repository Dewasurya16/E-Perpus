'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function BacaPDFModal({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatUrl = (originalUrl: string) => {
    if (!originalUrl) return '';
    if (originalUrl.includes('drive.google.com')) {
      return originalUrl.replace(/\/view.*|\/edit.*/, '/preview');
    }
    return originalUrl;
  };

  const cleanUrl = formatUrl(url);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-[#0F172A] flex flex-col animate-in fade-in duration-500 w-screen h-screen overflow-hidden">
      <div className="bg-slate-900/50 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center border-b border-white/5 flex-shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <span className="text-xl">📖</span>
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-emerald-400">Digital Library</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Mode Layar Penuh Aktif</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/25"
        >
          Tutup x
        </button>
      </div>

      <div className="flex-1 w-full bg-slate-800 relative">
        <iframe 
          src={cleanUrl} 
          className="w-full h-full border-none"
          title="E-Book Viewer"
        />
      </div>
    </div>
  );

  // Jika URL kosong, tampilkan tombol abu-abu (Disabled)
  if (!url) {
    return (
      <button disabled className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 cursor-not-allowed">
        <span>🔒</span> Belum Ada PDF
      </button>
    );
  }

  // Jika URL ada, tampilkan tombol hijau bisa diklik
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-blue-200 shadow-sm group"
      >
        <span className="group-hover:scale-125 transition-transform">📖</span> Baca E-Book
      </button>

      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}