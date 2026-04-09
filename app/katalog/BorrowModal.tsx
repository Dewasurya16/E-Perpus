"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function BorrowModal({ book }: { book: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    days: 7,
  });

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + formData.days);

      const { error: loanError } = await supabase.from("loans").insert([
        {
          book_id: book.id,
          employee_name: formData.name,
          employee_nip: formData.nip,
          due_date: dueDate.toISOString().split("T")[0],
          status: "Dipinjam",
        },
      ]);

      if (loanError) throw loanError;

      const { error: bookError } = await supabase
        .from("books")
        .update({ stock: book.stock - 1 })
        .eq("id", book.id);

      if (bookError) throw bookError;

      setIsSuccess(true);
      router.refresh();

      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ name: "", nip: "", days: 7 });
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setErrorMsg("Gagal meminjam buku. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={book.stock === 0}
        className="w-full bg-[#1B4332] text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-[#122c21] active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {book.stock > 0 ? "Pinjam Buku" : "Kosong"}
      </button>

      {/* OVERLAY MODAL - Z-index diset sangat tinggi (999) agar menutupi semuanya */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          
          {/* KONTEN MODAL - Animasi muncul dari bawah di HP, dan di tengah pada Desktop */}
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            
            {/* Header Modal - Super Clean */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10">
              <h3 className="font-bold text-gray-900">Form Peminjaman</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body Modal - Bisa di-scroll jika layar HP pendek */}
            <div className="p-6 overflow-y-auto">
              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-100">
                    <span className="text-4xl text-green-600">✓</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Berhasil!</h4>
                  <p className="text-gray-500 text-sm">Buku telah dicatat atas nama Anda.</p>
                </div>
              ) : (
                <form onSubmit={handleBorrow} className="space-y-5">
                  {/* Info Buku */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100/80">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Buku yang dipilih</p>
                    <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{book.title}</p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                      {errorMsg}
                    </div>
                  )}

                  {/* Input Fields - Diperbesar agar mudah disentuh di HP */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] outline-none transition-all placeholder:text-gray-400 text-sm"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">NIP (Pegawai)</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] outline-none transition-all placeholder:text-gray-400 text-sm"
                      placeholder="Contoh: 1980..."
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Durasi Pinjam</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white rounded-xl focus:ring-2 focus:ring-[#1B4332]/20 focus:border-[#1B4332] outline-none transition-all text-sm appearance-none"
                      value={formData.days}
                      onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                    >
                      <option value={3}>3 Hari</option>
                      <option value={7}>7 Hari (Standar)</option>
                      <option value={14}>14 Hari</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-1/3 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 px-4 py-3 bg-[#1B4332] text-white rounded-xl font-semibold hover:bg-[#122c21] disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-sm shadow-md shadow-[#1B4332]/20"
                    >
                      {isLoading ? "Memproses..." : "Konfirmasi"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}