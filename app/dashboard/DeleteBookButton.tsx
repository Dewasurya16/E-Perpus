"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function DeleteBookButton({ bookId, bookTitle }: { bookId: string, bookTitle: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Munculkan pop-up konfirmasi agar tidak tidak sengaja terhapus
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus buku "${bookTitle}" secara permanen?`);
    if (!confirmed) return;

    setIsDeleting(true);
    
    // Hapus dari database
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    
    if (error) {
      alert("Gagal menghapus buku. Pastikan buku ini sedang tidak dipinjam.");
      console.error(error);
    } else {
      router.refresh(); // Refresh halaman agar buku langsung hilang
    }
    
    setIsDeleting(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
      title="Hapus Buku"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}