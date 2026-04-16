'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 16, height: 16, flexShrink: 0,
      border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
      borderRadius: '50%', animation: 'spin .65s linear infinite'
    }} />
  );
}

export default function AddBookModal() {
  const [isOpen,     setIsOpen]     = useState(false);
  const [title,      setTitle]      = useState('');
  const [author,     setAuthor]     = useState('');
  const [publisher,  setPublisher]  = useState('');
  const [category,   setCategory]   = useState('');
  const [nomorBuku,  setNomorBuku]  = useState('');
  const [stock,      setStock]      = useState(1);
  const [rak,        setRak]        = useState('');
  const [pdfUrl,     setPdfUrl]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const router = useRouter();

  const resetForm = () => {
    setTitle(''); setAuthor(''); setPublisher('');
    setCategory(''); setNomorBuku(''); setStock(1); setRak(''); setPdfUrl('');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('books').insert([
      { title, author, publisher, category, nomor_buku: nomorBuku, stock, rak, pdf_url: pdfUrl }
    ]);
    setLoading(false);
    if (!error) { setIsOpen(false); resetForm(); router.refresh(); }
    else alert('Gagal menambah buku! Error: ' + error.message);
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-[#1B4332] hover:bg-[#143628] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
      >
        <span>➕</span> Tambah Buku Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left my-8 relative">

            {loading && (
              <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3">
                <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Menyimpan...</p>
              </div>
            )}

            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">Tambah Buku Baru</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-500 font-bold transition-colors">✕</button>
            </div>

            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Buku</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800"
                  placeholder="Contoh: KUHP Edisi Revisi" />
              </div>

              {/* Nomor Buku + Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Buku</label>
                  <input type="text" value={nomorBuku} onChange={(e) => setNomorBuku(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800"
                    placeholder="Contoh: 001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                  <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800"
                    placeholder="Hukum Pidana" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penulis</label>
                  <input required type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800"
                    placeholder="Nama Penulis" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penerbit</label>
                  <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800"
                    placeholder="Nama Penerbit" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sisa Stok</label>
                  <input required type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lokasi Rak</label>
                  <input type="text" value={rak} onChange={(e) => setRak(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800"
                    placeholder="Contoh: A-1" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Link E-Book (PDF)</label>
                <input type="url" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] outline-none transition-all font-medium text-slate-800"
                  placeholder="https://..." />
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#143628] text-white rounded-xl font-bold shadow-lg shadow-[#1B4332]/20 transition-all disabled:opacity-60 flex items-center gap-2">
                  {loading ? <><Spinner /> Menyimpan...</> : 'Simpan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}