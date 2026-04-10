'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

// IMPORT KOMPONEN BACA PDF KITA (Wajib Ada!)
import BacaPDFModal from './BacaPDFModal'; 

export default function ScanBukuModal({ books }: { books: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let isComponentMounted = true; 
    let scanner: Html5QrcodeScanner | null = null;
    let timer: NodeJS.Timeout;

    if (isOpen && !scannedBook) {
      timer = setTimeout(() => {
        if (!isComponentMounted) return;
        
        scanner = new Html5QrcodeScanner("qr-reader-box", { 
          qrbox: { width: 250, height: 250 }, 
          fps: 10,
          rememberLastUsedCamera: true, 
          supportedScanTypes: [0] 
        }, false);
        
        scanner.render(
          (result) => {
            const found = books.find(b => b.id === result);
            if (found) {
              setScannedBook(found);
            }
          },
          () => {} 
        );
      }, 300);
    }

    return () => { 
      isComponentMounted = false;
      if (timer) clearTimeout(timer);
      if (scanner) {
         scanner.clear().catch(() => {}); 
      }
    };
  }, [isOpen, scannedBook, books]);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 sm:p-8 relative animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><span>📷</span> Pemindai Pintar</h3>
          <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600 flex items-center justify-center font-bold transition-colors">✕</button>
        </div>

        {scannedBook ? (
          <div className="text-center animate-in zoom-in duration-300">
            <span className="text-5xl block mb-3">📚</span>
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest">Aset Ditemukan</p>
            <h4 className="text-lg font-black text-slate-800 leading-snug mb-6">{scannedBook.title}</h4>

            {/* INFO RAK & STOK FISIK */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi Rak</p>
                <p className="font-bold text-sm text-slate-800">📍 {scannedBook.rak || 'TBA'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sisa Stok</p>
                <p className={`font-bold text-sm ${scannedBook.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {scannedBook.stock > 0 ? `${scannedBook.stock} Tersedia` : 'Habis'}
                </p>
              </div>
            </div>

            {/* AREA TOMBOL AKSI */}
            <div className="space-y-3">
              {/* Memanggil Tombol Baca E-Book yang sudah kita percantik sebelumnya */}
              <BacaPDFModal url={scannedBook.pdf_url} />

              <button onClick={() => setScannedBook(null)} className="w-full bg-slate-100 text-slate-500 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-200 transition-colors border border-slate-200">
                Pindai Buku Lain
              </button>
            </div>

          </div>
        ) : (
          <div>
            <div className="[&_select]:w-full [&_select]:p-4 [&_select]:bg-slate-50 [&_select]:rounded-2xl [&_select]:border-2 [&_select]:border-slate-200 [&_select]:mb-4 [&_select]:font-bold [&_select]:text-sm [&_select]:text-slate-700 [&_select]:outline-none [&_select]:focus:border-emerald-500 [&_button]:w-full [&_button]:bg-[#1B4332] [&_button]:text-white [&_button]:py-4 [&_button]:rounded-2xl [&_button]:font-black [&_button]:text-xs [&_button]:uppercase [&_button]:tracking-widest [&_button]:hover:bg-[#143628] [&_button]:transition-colors [&_a]:hidden overflow-hidden">
              <div id="qr-reader-box" className="w-full overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300 bg-slate-50 min-h-[300px]"></div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-center text-[10px] font-bold text-amber-700 uppercase leading-relaxed">
                💡 <span className="font-black text-amber-800">Ganti Kamera?</span><br/>
                Klik tombol <strong className="text-slate-800">"STOP SCANNING"</strong>, lalu pilih kamera dari menu.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => { setIsOpen(true); setScannedBook(null); }} className="h-14 px-5 sm:px-6 flex items-center justify-center gap-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex-shrink-0">
        <span className="text-xl">📷</span>
        <span className="hidden sm:block">Scan</span>
      </button>
      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}