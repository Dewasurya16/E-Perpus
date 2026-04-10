"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ReturnButton({ loan }: { loan: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Pastikan komponen sudah nempel di browser (Hydration Fix)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const prosesKembali = async () => {
    if (!loan?.book_id || !loan?.id) {
      alert("Data Error: ID Buku atau ID Pinjaman hilang!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Ambil stok terbaru
      const { data: bData, error: fError } = await supabase
        .from("books")
        .select("stock")
        .eq("id", loan.book_id)
        .single();
      
      if (fError) throw fError;

      // 2. Update status sirkulasi
      const { error: lError } = await supabase
        .from("loans")
        .update({ 
          status: "DIKEMBALIKAN", 
          return_date: new Date().toISOString() 
        })
        .eq("id", loan.id);
      
      if (lError) throw lError;

      // 3. Update stok buku
      await supabase
        .from("books")
        .update({ stock: (bData?.stock || 0) + 1 })
        .eq("id", loan.book_id);

      alert("✅ BERHASIL! Aset sudah kembali.");
      
      // Paksa refresh jalur keras
      router.refresh();
      window.location.reload(); 

    } catch (error: any) {
      alert("Database Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  // Cek status (kebal huruf besar/kecil)
  const statusAktif = loan.status?.toUpperCase();
  if (statusAktif === "DIKEMBALIKAN" || statusAktif === "SUDAH DIULAS") {
    return (
      <div className="text-[10px] font-black text-slate-300 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 uppercase tracking-widest italic opacity-50">
        Selesai
      </div>
    );
  }

  return (
    <div className="relative inline-block group">
      {/* TOMBOL UTAMA */}
      <button
        type="button"
        disabled={isLoading}
        // JALUR PAKSA: Langsung panggil fungsi tanpa perantara e.preventDefault berlebih
        onClick={() => {
          if (window.confirm(`Konfirmasi pengembalian: ${loan.books?.title || 'Aset'}?`)) {
            prosesKembali();
          }
        }}
        // STYLE TACTICAL: Kita kasih border mencolok biar Bos tahu kalau kursor nempel
        className={`
          relative z-[9999] 
          px-6 py-2.5 
          bg-[#1B4332] text-white 
          rounded-xl text-[10px] font-black uppercase tracking-[0.15em]
          hover:bg-emerald-700 hover:ring-4 hover:ring-emerald-100
          active:scale-90 transition-all duration-200
          shadow-[0_4px_10px_rgba(27,67,50,0.3)]
          disabled:opacity-50 cursor-pointer
        `}
      >
        {isLoading ? "..." : "Kembalikan"}
      </button>

      {/* LAYER PENGAMAN: Kalau tombol di atas masih 'mati', layer ini akan menangkap kliknya */}
      <div 
        onClick={() => !isLoading && window.confirm("Konfirmasi?") && prosesKembali()}
        className="absolute inset-0 z-[9998] cursor-pointer"
      />
    </div>
  );
}