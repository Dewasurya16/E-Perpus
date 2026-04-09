'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeModal({ book }: { book: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 transition-colors"
        title="Cetak QR Code Buku"
      >
        🖨️ QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 font-bold transition-colors">✕</button>
            
            <h3 className="text-xl font-black text-slate-800 mb-1">QR Code Aset</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium line-clamp-2">{book.title}</p>
            
            {/* Area QR Code */}
            <div className="flex flex-col items-center justify-center p-6 bg-white border-4 border-slate-100 rounded-[2rem] mb-6 shadow-sm">
               <QRCodeSVG value={book.id} size={200} level="H" includeMargin={true} />
            </div>
            
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase bg-slate-50 py-2 rounded-lg border border-slate-100">
              ID: {book.id.split('-')[0]}...
            </p>
            <p className="text-[10px] text-slate-400 mt-4">Scan menggunakan fitur kamera E-Perpus</p>
          </div>
        </div>
      )}
    </>
  );
}