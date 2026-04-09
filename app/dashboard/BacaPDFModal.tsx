'use client';
import { useState } from 'react';

export default function BacaPDFModal({ url }: { url: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) return null; // Sembunyikan tombol jika tidak ada link PDF

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 transition-colors"
      >
        📖 Baca E-Book
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-6">
          <div className="bg-white w-full h-[90vh] max-w-5xl rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-black text-slate-800 flex items-center gap-2"><span>📑</span> Pembaca Dokumen Elektronik</h3>
              <button onClick={() => setIsOpen(false)} className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full font-black hover:bg-rose-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="flex-1 bg-slate-200 w-full relative">
              <iframe 
                src={`${url}#toolbar=0`} 
                className="w-full h-full absolute top-0 left-0 border-none"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}