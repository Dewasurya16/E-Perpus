'use client';
import { useState, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScanBukuModal({ books }: { books: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const scannerId = "reader-" + useId().replace(/:/g, ''); 

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let scanner: Html5QrcodeScanner;
    
    if (isOpen && !scannedBook) {
      setErrorMsg('');
      
      // JEDA 200ms AGAR MODAL SELESAI TAMPIL DULU, BARU KAMERA NYALA
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner(scannerId, { 
          qrbox: { width: 250, height: 250 }, 
          fps: 10,
          rememberLastUsedCamera: true
        }, false);
        
        scanner.render(
          (result) => {
            const found = books.find(b => b.id === result);
            if (found) {
              setScannedBook(found);
              setErrorMsg('');
            } else {
              setErrorMsg(`ID tidak terdaftar.`);
            }
            scanner.clear(); // Matikan kamera setelah dapat
          },
          (err) => { /* Abaikan error */ }
        );
      }, 200);

      return () => { 
        clearTimeout(timer);
        if (scanner) {
            scanner.clear().catch(e => console.error(e)); 
        }
      };
    }
  }, [isOpen, scannedBook, books, scannerId]);

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><span>🔍</span> Kamera Pemindai</h3>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 font-bold transition-colors">✕</button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-xl text-center">
            {errorMsg}
            <button onClick={() => {setErrorMsg(''); setScannedBook(null);}} className="block mx-auto mt-2 text-[10px] underline hover:text-rose-800">Coba Pindai Ulang</button>
          </div>
        )}

        {scannedBook ? (
          <div className="text-center p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-inner">
            <span className="text-5xl block mb-4">✅</span>
            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1">Buku Ditemukan!</p>
            <p className="text-lg font-black text-slate-900 leading-snug mb-4">{scannedBook.title}</p>
            
            <div className="grid grid-cols-2 gap-2 text-left mb-6">
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Kategori</p>
                <p className="font-bold text-sm text-slate-700 truncate">{scannedBook.category}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Lokasi Rak</p>
                <p className="font-bold text-sm text-purple-600">📍 {scannedBook.rak || 'TBA'}</p>
              </div>
            </div>

            <button onClick={() => setScannedBook(null)} className="w-full bg-[#1B4332] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#143628] transition-colors shadow-lg">Scan Buku Lain</button>
          </div>
        ) : (
          <div className="[&_select]:w-full [&_select]:p-3 [&_select]:rounded-xl [&_select]:border-slate-300 [&_select]:mb-3 [&_select]:text-sm [&_button]:w-full [&_button]:bg-[#1B4332] [&_button]:text-white [&_button]:px-4 [&_button]:py-3 [&_button]:rounded-xl [&_button]:font-bold [&_button]:text-sm [&_a]:hidden">
            <div id={scannerId} className="w-full overflow-hidden rounded-2xl border-2 border-dashed border-emerald-300 bg-slate-50 min-h-[250px]"></div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => { setIsOpen(true); setScannedBook(null); }} className="flex-1 md:flex-none justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors border border-emerald-200/50 shadow-sm">
        <span className="text-lg">📷</span> Scan Buku
      </button>
      
      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}