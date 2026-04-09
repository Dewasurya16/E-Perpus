'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function BacaPDFModal({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!url) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
      
      {/* HEADER NAVBAR PEMBACA */}
      <div className="bg-white/10 text-white px-6 py-4 flex justify-between items-center border-b border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">Pembaca E-Book Digital</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Mode Layar Penuh Aktif</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/30"
        >
          Tutup x
        </button>
      </div>

      {/* AREA PEMBACA PDF - DIBUAT MAKSIMAL */}
      <div className="flex-1 w-full max-w-6xl mx-auto bg-white shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        <iframe 
          src={`${url}#toolbar=0&navpanes=0`} 
          className="w-full h-full border-none"
          title="E-Book Viewer"
        />
      </div>

      {/* FOOTER KECIL */}
      <div className="bg-black/20 text-white/40 text-[9px] text-center py-2 uppercase tracking-[0.3em] font-bold">
        E-Perpus Kejaksaan RI • Proyek Rantau 2026
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-200 shadow-sm group"
      >
        <span className="group-hover:scale-125 transition-transform">📖</span> Baca E-Book
      </button>

      {/* Gunakan Portal agar tidak terjebak di dalam Card Buku */}
      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}