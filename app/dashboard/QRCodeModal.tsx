"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export default function QRCodeModal({ book, isLoggedIn = false }: { book: any, isLoggedIn?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // URL Cerdas untuk QR Code
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://e-perpus.kejaksaan.go.id';
  const qrData = `${appUrl}/buku/${book?.id}`;

  return (
    <>
      {/* TOMBOL TRIGGER DI KARTU BUKU */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 border border-slate-200 shadow-sm transition-all active:scale-95 gap-2"
      >
        <span className="text-sm">🔍</span> Detail & QR
      </button>

      {/* MODAL PORTAL UNTUK DETAIL DAN QR */}
      {mounted && isOpen && createPortal(
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-3xl flex flex-col-reverse md:flex-row overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            {/* TOMBOL CLOSE (X) */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-200/50 text-slate-600 rounded-full hover:bg-slate-200 transition-all font-bold z-10"
            >
              ✕
            </button>

            {/* KIRI: INFORMASI BUKU */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 mt-2 md:mt-0">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                    {book?.category || 'Umum'}
                  </span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded border border-amber-100 text-[9px] font-black tracking-widest flex items-center gap-1">
                    ⭐ {book?.rating || '0.0'}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-6">
                  {book?.title || 'Judul Tidak Tersedia'}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Lokasi Rak</p>
                    <p className="text-sm font-black text-slate-700">{book?.rak || 'Belum Diatur'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sisa Stok Fisik</p>
                    <p className="text-sm font-black text-slate-700">{book?.stock || 0} Pcs</p>
                  </div>
                </div>
              </div>

              {/* AREA TOMBOL AKSI */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Baca E-Book (Publik Bisa) */}
                <a 
                  href={book?.pdf_url || '#'} 
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex justify-center items-center gap-2"
                  onClick={(e) => {
                    if(!book?.pdf_url) {
                      e.preventDefault();
                      alert("Mohon maaf, file E-Book (PDF) untuk buku ini belum diunggah oleh Admin.");
                    }
                  }}
                >
                  <span className="text-sm">📖</span> Baca E-Book
                </a>

                {/* Pinjam Fisik (Harus Login) */}
                {isLoggedIn ? (
                  <Link 
                    href="/dashboard?tab=buku"
                    className="flex-1 text-center py-4 bg-[#1B4332] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#123023] transition-all shadow-md flex justify-center items-center gap-2"
                  >
                    <span className="text-sm">📚</span> Pinjam Fisik
                  </Link>
                ) : (
                  <Link 
                    href="/login"
                    className="flex-1 text-center py-4 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md flex justify-center items-center gap-2"
                  >
                    <span className="text-sm">🔐</span> Login & Pinjam
                  </Link>
                )}
              </div>
            </div>

            {/* KANAN: KOTAK QR CODE */}
            <div className="w-full md:w-72 bg-slate-50 p-6 md:p-10 flex flex-col items-center justify-center border-l border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Scan QR Aset</p>
              
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-6 w-40 h-40">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase truncate w-full text-center bg-white py-2 rounded-lg border border-slate-100 mb-2">
                ID: {book?.id ? book.id.substring(0, 8) + '...' : "XXXXXXXX"}
              </p>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center px-2">
                Gunakan kamera HP untuk scan
              </p>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  );
}