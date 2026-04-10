'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { createPortal } from 'react-dom';

export default function MyHistory({ userEmail }: { userEmail: string }) {
  const [loans, setLoans] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [selectedStar, setSelectedStar] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchMyLoans();
  }, [userEmail]);

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const username = userEmail.split('@')[0].toLowerCase(); 
      const { data, error } = await supabase
        .from('loans')
        .select('*, books(*)')
        .or(`employee_name.ilike.%${username}%,employee_name.ilike.%${userEmail}%`)
        .order('id', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnAction = async (loan: any) => {
    if (!window.confirm(`Kembalikan buku "${loan.books?.title}"?`)) return;
    try {
      await supabase.from('loans').update({ status: 'Dikembalikan', return_date: new Date().toISOString() }).eq('id', loan.id);
      await supabase.from('books').update({ stock: (loan.books?.stock || 0) + 1 }).eq('id', loan.book_id);
      
      setRatingModal({
        loanId: loan.id,
        bookId: loan.book_id,
        title: loan.books?.title,
        currentRating: loan.books?.rating || 0,
        currentCount: loan.books?.rating_count || 0
      });
      fetchMyLoans();
    } catch (err) { alert("Gagal proses."); }
  };

  const submitReview = async () => {
    try {
      const newCount = (ratingModal.currentCount || 0) + 1;
      const newRating = ((ratingModal.currentRating * ratingModal.currentCount) + selectedStar) / newCount;
      
      await supabase.from('books').update({ rating: newRating, rating_count: newCount }).eq('id', ratingModal.bookId);
      await supabase.from('loans').update({ status: 'Sudah Diulas' }).eq('id', ratingModal.loanId);

      setRatingModal(null);
      alert("Ulasan Terkirim!");
      fetchMyLoans();
    } catch (err) { alert("Gagal ulas."); }
  };

  if (loading) return <div className="p-10 text-center font-black text-slate-300 text-[10px] tracking-[0.3em]">SYNCING...</div>;

  return (
    <section className="mt-20 mb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] flex-1 bg-slate-200"></div>
        <span className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 shadow-sm">
          Log Aktivitas Digital
        </span>
        <div className="h-[1px] flex-1 bg-slate-200"></div>
      </div>

      {/* WRAPPER SCROLL: Biar riwayat banyak tidak ngerusak halaman */}
      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
        {loans.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kosong</p>
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                  loan.status?.toLowerCase() === 'dipinjam' ? 'bg-amber-100 text-amber-700' : 
                  loan.status === 'Sudah Diulas' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {loan.status}
                </span>
                <h4 className="font-black text-slate-800 text-sm mt-2 truncate">{loan.books?.title}</h4>
              </div>

              <div className="flex-shrink-0">
                {loan.status?.toLowerCase() === 'dipinjam' ? (
                  <button onClick={() => handleReturnAction(loan)} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Kembalikan</button>
                ) : loan.status?.toLowerCase() === 'dikembalikan' ? (
                  <button onClick={() => setRatingModal({ loanId: loan.id, bookId: loan.book_id, title: loan.books?.title, currentRating: loan.books?.rating || 0, currentCount: loan.books?.rating_count || 0 })} className="px-4 py-2.5 bg-amber-400 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-md">⭐ Ulas</button>
                ) : (
                  <div className="px-4 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase italic border border-slate-100">Sudah Diulas</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {mounted && ratingModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <h4 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Beri Rating</h4>
            <div className="flex justify-center gap-3 mb-10 text-4xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setSelectedStar(s)} className={`transition-all ${s <= selectedStar ? 'text-amber-400' : 'text-slate-100'}`}>★</button>
              ))}
            </div>
            <button onClick={submitReview} className="w-full py-5 bg-[#1B4332] text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-[#143628] transition-all">Simpan Ulasan</button>
          </div>
        </div>, document.body
      )}
    </section>
  );
}