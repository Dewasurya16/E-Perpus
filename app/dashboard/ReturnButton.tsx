"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ReturnButton({ loan }: { loan: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleReturn = async () => {
    // Konfirmasi sebelum mengembalikan
    if (!window.confirm(`Konfirmasi pengembalian buku dari ${loan.employee_name}?`)) return;
    
    setIsLoading(true);
    try {
      // 1. Update status peminjaman menjadi Dikembalikan
      const { error: loanError } = await supabase
        .from("loans")
        .update({ 
          status: "Dikembalikan", 
          return_date: new Date().toISOString().split("T")[0] // Tanggal hari ini
        })
        .eq("id", loan.id);

      if (loanError) throw loanError;

      // 2. Tambah stok buku kembali (+1)
      const { error: bookError } = await supabase
        .from("books")
        .update({ stock: loan.books.stock + 1 })
        .eq("id", loan.book_id);

      if (bookError) throw bookError;

      // Refresh halaman untuk memperbarui tabel
      router.refresh();
    } catch (error) {
      console.error("Gagal mengembalikan buku:", error);
      alert("Terjadi kesalahan sistem saat mengembalikan buku.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loan.status === "Dikembalikan") {
    return (
      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
        Selesai
      </span>
    );
  }

  return (
    <button
      onClick={handleReturn}
      disabled={isLoading}
      className="text-xs font-bold bg-[#1B4332] text-white px-3 py-1.5 rounded-md hover:bg-[#122c21] transition-all shadow-sm disabled:opacity-50"
    >
      {isLoading ? "Memproses..." : "Kembalikan"}
    </button>
  );
}