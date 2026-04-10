'use client';
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// Kita tambahkan 'userEmail' ke dalam Props
export default function BorrowModal({ book, userEmail }: { book: any, userEmail: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ambil nama depan dari email untuk default nama (contoh: pembinaan@gmail.com -> pembinaan)
  const autoName = userEmail.split('@')[0];

  const [formData, setFormData] = useState({ 
    name: autoName, // Otomatis terisi nama akun
    nip: "", 
    days: 7 
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + formData.days);

      // Simpan ke database menggunakan nama otomatis
      await supabase.from("loans").insert([{
        book_id: book.id,
        employee_name: formData.name, // Ini sekarang sinkron dengan nama login
        employee_nip: formData.nip,
        due_date: dueDate.toISOString().split("T")[0],
        status: "Dipinjam",
      }]);

      await supabase.from("books").update({ stock: book.stock - 1 }).eq("id", book.id);

      setIsSuccess(true);
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ name: autoName, nip: "", days: 7 });
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Gagal memproses pinjaman.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Konfirmasi Pinjaman</h3>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Kejaksaan Republik Indonesia</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-rose-600 font-bold transition-all">✕</button>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">✓</div>
              <h4 className="text-2xl font-black text-slate-800">Selesai!</h4>
              <p className="text-sm font-medium text-slate-500 mt-2">Buku berhasil dicatat atas nama <span className="font-bold text-slate-800">{formData.name}</span>.</p>
            </div>
          ) : (
            <form onSubmit={handleBorrow} className="space-y-6">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4 items-center">
                <div className="w-10 h-14 bg-[#1B4332] rounded flex-shrink-0 flex items-center justify-center text-white text-lg">📖</div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Aset Referensi</p>
                  <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{book.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Peminjam (Otomatis)</label>
                  <input readOnly type="text" className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed" value={formData.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NIP Pegawai</label>
                  <input required type="text" placeholder="Wajib diisi..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded-xl outline-none transition-all font-bold text-sm text-slate-800" value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Durasi</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#1B4332] rounded-xl outline-none font-bold text-sm text-slate-800" value={formData.days} onChange={(e) => setFormData({...formData, days: Number(e.target.value)})}>
                    <option value={7}>7 Hari (Standar)</option>
                    <option value={14}>14 Hari (Lama)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all border border-slate-200">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-[#1B4332] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#143628] transition-all disabled:opacity-50">
                  {isLoading ? "Memproses..." : "Konfirmasi & Pinjam"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={book.stock === 0}
        className="w-full bg-slate-900 text-white px-4 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-md"
      >
        {book.stock > 0 ? "Pinjam Buku Fisik" : "Stok Sedang Kosong"}
      </button>

      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}