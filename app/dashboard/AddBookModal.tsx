'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddBookModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(''); // Kembalikan state Penulis
  const [publisher, setPublisher] = useState(''); // Kembalikan state Penerbit
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(1);
  const [rak, setRak] = useState(''); 
  const [pdfUrl, setPdfUrl] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Kirim data LENGKAP ke Supabase
    const { error } = await supabase.from('books').insert([
      { title, author, publisher, category, stock, rak, pdf_url: pdfUrl }
    ]);
    
    setLoading(false);
    
    if (!error) {
      setIsOpen(false);
      // Reset form setelah sukses
      setTitle(''); setAuthor(''); setPublisher(''); setCategory(''); setStock(1); setRak(''); setPdfUrl('');
      router.refresh();
    } else {
      alert('Gagal menambah buku! Error: ' + error.message);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-full sm:w-auto bg-[#1B4332] hover:bg-[#143628] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2">
        <span>➕</span> Tambah Buku Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">Tambah Buku Baru</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-500 font-bold transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Buku</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" placeholder="Contoh: KUHP Edisi Revisi" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penulis</label>
                  <input required type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" placeholder="Nama Penulis" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penerbit</label>
                  <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" placeholder="Nama Penerbit" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                  <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" placeholder="Hukum Pidana" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sisa Stok</label>
                  <input required type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lokasi Rak</label>
                  <input type="text" value={rak} onChange={(e) => setRak(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" placeholder="Contoh: A-1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Link E-Book (PDF)</label>
                  <input type="url" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" placeholder="https://..." />
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#143628] text-white rounded-xl font-bold shadow-lg shadow-[#1B4332]/20 transition-all disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}