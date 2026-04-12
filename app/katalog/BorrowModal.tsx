'use client';
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function BorrowModal({ book, userEmail }: { book: any; userEmail: string }) {
  const router = useRouter();
  const [isOpen,   setIsOpen]   = useState(false);
  const [isLoading,setIsLoading]= useState(false);
  const [isSuccess,setIsSuccess]= useState(false);
  const [mounted,  setMounted]  = useState(false);

  // Cari nama asli pegawai dari tabel Data Pegawai berdasarkan email
  const [staffName, setStaffName] = useState('');
  const autoName = userEmail.split('@')[0]; // fallback

  useEffect(() => {
    setMounted(true);

    // Coba ambil nama asli dari tabel "Data Pegawai" agar sinkron dengan booking Lexi
    const fetchStaffName = async () => {
      const { data } = await supabase
        .from('Data Pegawai')
        .select('Nama')
        .ilike('Email', `%${autoName}%`)  // cocokkan prefix email
        .limit(1)
        .single();
      if (data?.Nama) {
        setStaffName(data.Nama);
      }
    };
    fetchStaffName();
  }, [autoName]);

  const displayName = staffName || autoName;

  const [formData, setFormData] = useState({ nip: "", days: 7 });

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // guard double-submit
    setIsLoading(true);

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + formData.days);

      // Insert ke loans — status UPPERCASE agar konsisten dengan sistem Lexi & admin
      const { error: loanError } = await supabase.from("loans").insert([{
        book_id:       book.id,
        employee_name: displayName,       // nama asli dari Data Pegawai (atau prefix email)
        employee_nip:  formData.nip,
        due_date:      dueDate.toISOString(),
        status:        "DIPINJAM",        // ← UPPERCASE, konsisten dengan route-chat.ts
        borrowed_via:  "KATALOG",         // ← penanda sumber peminjaman
        user_email:    userEmail,         // ← simpan email agar History bisa query dengan tepat
      }]);

      if (loanError) throw new Error(loanError.message);

      // Kurangi stok buku
      const { error: stockError } = await supabase
        .from("books")
        .update({ stock: book.stock - 1 })
        .eq("id", book.id);

      if (stockError) throw new Error(stockError.message);

      setIsSuccess(true);
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ nip: "", days: 7 });
      }, 2200);
    } catch (error: any) {
      console.error(error);
      alert("Gagal memproses pinjaman: " + error.message);
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
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-rose-600 font-bold transition-all text-lg">✕</button>
        </div>

        <div className="p-8">
          {isSuccess ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">✓</div>
              <h4 className="text-2xl font-black text-slate-800">Berhasil!</h4>
              <p className="text-sm font-medium text-slate-500 mt-2">
                Buku dicatat atas nama <span className="font-bold text-slate-800">{displayName}</span>.
              </p>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">
                Cek di Riwayat Pinjaman ↓
              </p>
            </div>
          ) : (
            <form onSubmit={handleBorrow} className="space-y-6">
              {/* Info buku */}
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4 items-center">
                <div className="w-10 h-14 bg-[#1B4332] rounded-lg flex-shrink-0 flex items-center justify-center text-white text-lg shadow-md">📖</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Aset Referensi</p>
                  <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{book.title}</p>
                  {book.rak && <p className="text-[9px] text-slate-400 font-bold mt-0.5">📍 Rak {book.rak}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nama otomatis — read-only */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Peminjam</label>
                  <div className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-5 h-5 bg-emerald-600 rounded-full text-white text-[9px] flex items-center justify-center font-black flex-shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    {displayName}
                  </div>
                </div>

                {/* NIP */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NIP Pegawai</label>
                  <input
                    required
                    type="text"
                    placeholder="Wajib diisi..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 rounded-xl outline-none transition-all font-bold text-sm text-slate-800"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  />
                </div>

                {/* Durasi */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Durasi Pinjaman</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 rounded-xl outline-none font-bold text-sm text-slate-800 transition-all"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                  >
                    <option value={7}>7 Hari (Standar)</option>
                    <option value={14}>14 Hari (Diperpanjang)</option>
                  </select>
                </div>
              </div>

              {/* Tenggat preview */}
              <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                <span className="text-amber-500">📅</span>
                <p className="text-[11px] font-bold text-amber-700">
                  Tenggat pengembalian:{" "}
                  <span className="font-black">
                    {new Date(Date.now() + formData.days * 86400000).toLocaleDateString("id-ID", {
                      weekday: "long", day: "2-digit", month: "long", year: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#1B4332] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#143628] transition-all disabled:opacity-50 py-4 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Memproses...
                    </>
                  ) : "Konfirmasi & Pinjam"}
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
        onClick={() => { if (book.stock > 0) setIsOpen(true); }}
        disabled={book.stock === 0}
        className="w-full bg-slate-900 text-white px-4 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-md"
      >
        {book.stock > 0 ? "📚 Pinjam Buku Fisik" : "Stok Sedang Kosong"}
      </button>

      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}