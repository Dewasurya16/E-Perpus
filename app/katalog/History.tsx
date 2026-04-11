'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { createPortal } from 'react-dom';

export default function MyHistory({ userEmail }: { userEmail: string }) {
  const [loans, setLoans] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modals & Loading
  const [confirmModal, setConfirmModal] = useState<any>(null);
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [selectedStar, setSelectedStar] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMyLoans();
  }, [userEmail]);

  const fetchMyLoans = async () => {
    try {
      const username = userEmail.split('@')[0].toLowerCase(); 
      const { data, error } = await supabase.from('loans').select('*, books(*)')
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

  const executeReturn = async () => {
    setIsProcessing(true);
    try {
      await supabase.from('loans').update({ status: 'DIKEMBALIKAN', return_date: new Date().toISOString() }).eq('id', confirmModal.id);
      await supabase.from('books').update({ stock: (confirmModal.books?.stock || 0) + 1 }).eq('id', confirmModal.book_id);
      
      setRatingModal({ 
        loanId: confirmModal.id, 
        bookId: confirmModal.book_id, 
        title: confirmModal.books?.title, 
        currentRating: confirmModal.books?.rating || 0, 
        currentCount: confirmModal.books?.rating_count || 0 
      });
      
      setConfirmModal(null);
      fetchMyLoans(); 
    } catch (err) { 
      alert("Gagal memproses pengembalian."); 
    } finally {
      setIsProcessing(false);
    }
  };

  const submitReview = async () => {
    setIsProcessing(true);
    try {
      const currentCount = Number(ratingModal.currentCount) || 0;
      const currentRating = Number(ratingModal.currentRating) || 0;
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + selectedStar) / newCount;

      await supabase.from('books').update({ 
        rating: Number(newRating.toFixed(1)), 
        rating_count: newCount 
      }).eq('id', ratingModal.bookId);
      
      await supabase.from('loans').update({ status: 'SUDAH DIULAS' }).eq('id', ratingModal.loanId);

      setRatingModal(null); 
      fetchMyLoans(); 
    } catch (err: any) { 
      alert("Gagal simpan ulasan: " + err.message); 
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-slate-300 text-[10px] tracking-widest animate-pulse">MEMUAT RIWAYAT...</div>;

  return (
    <section className="mt-8 mb-20 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {loans.length === 0 ? (
          <div className="col-span-full py-20 bg-white border border-dashed border-slate-200 rounded-3xl text-center">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Belum Ada Riwayat Pinjaman</p>
          </div>
        ) : (
          loans.map((loan) => {
            const status = loan.status?.toUpperCase();
            
            // Logika Warna Aksen
            const accentColor = 
              status === 'DIPINJAM' ? 'bg-amber-400' : 
              status === 'SUDAH DIULAS' ? 'bg-blue-400' : 
              'bg-emerald-400';

            const badgeStyle = 
              status === 'DIPINJAM' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
              status === 'SUDAH DIULAS' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
              'bg-emerald-50 text-emerald-600 border-emerald-200';

            return (
              <div key={loan.id} className="relative bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden group">
                
                {/* Garis Aksen Kiri Biar Kece */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor} opacity-80 group-hover:opacity-100 transition-opacity`}></div>

                {/* Info Buku */}
                <div className="flex-1 min-w-0 w-full pl-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${badgeStyle}`}>
                      {loan.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold tracking-tight bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      Tenggat: {new Date(loan.due_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-[15px] leading-snug truncate pr-2">
                    {loan.books?.title || 'Buku Tidak Tersedia'}
                  </h4>
                </div>

                {/* Area Tombol */}
                <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                  {status === 'DIPINJAM' ? (
                    <button 
                      onClick={() => setConfirmModal(loan)} 
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#1B4332] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 shadow-md transition-all active:scale-95"
                    >
                      Kembalikan
                    </button>
                  ) : status === 'DIKEMBALIKAN' ? (
                    <button 
                      onClick={() => setRatingModal({ loanId: loan.id, bookId: loan.book_id, title: loan.books?.title, currentRating: loan.books?.rating || 0, currentCount: loan.books?.rating_count || 0 })} 
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-amber-500 hover:to-amber-600 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span className="text-sm">⭐</span> Beri Ulasan
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-inner">
                      Selesai ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL KONFIRMASI (Tetap Premium) */}
      {/* ========================================= */}
      {mounted && confirmModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">📚</div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Kembalikan Buku?</h4>
            <p className="text-xs text-slate-500 font-medium mb-8 px-2">Pastikan buku <span className="font-bold text-slate-800">"{confirmModal.books?.title}"</span> sudah siap dikembalikan ke petugas.</p>
            
            <div className="flex gap-3">
              <button disabled={isProcessing} onClick={() => setConfirmModal(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Batal</button>
              <button disabled={isProcessing} onClick={executeReturn} className="flex-1 py-3.5 bg-[#1B4332] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#123023] transition-all disabled:opacity-50">
                {isProcessing ? "Proses..." : "Kembalikan"}
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* ========================================= */}
      {/* MODAL RATING (Tetap Smooth) */}
      {/* ========================================= */}
      {mounted && ratingModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">⭐</div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Beri Penilaian</h4>
            <p className="text-[11px] text-slate-400 font-bold uppercase mb-8 line-clamp-2 px-4">"{ratingModal.title}"</p>
            
            <div className="flex justify-center gap-2 mb-10 text-5xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setSelectedStar(s)} className={`transition-all hover:scale-110 focus:outline-none ${s <= selectedStar ? 'text-amber-400 drop-shadow-md scale-110' : 'text-slate-100'}`}>★</button>
              ))}
            </div>
            
            <button disabled={isProcessing} onClick={submitReview} className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50">
              {isProcessing ? "Menyimpan..." : "Simpan Ulasan"}
            </button>
            <button disabled={isProcessing} onClick={() => setRatingModal(null)} className="mt-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Nanti Saja</button>
          </div>
        </div>, document.body
      )}
    </section>
  );
}