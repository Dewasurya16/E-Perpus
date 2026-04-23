// SIMPAN FILE INI DI: app/buku/[id]/page.tsx
// (Buat folder baru: app/buku/[id]/)

import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/* ── Warna cover berdasarkan hash ID ─────────────────────────────────── */
const COVERS = [
  ['#1B4332', '#52B788'], ['#1D3557', '#457B9D'], ['#6B2D8B', '#C9A0DC'],
  ['#7B2D00', '#D4956A'], ['#2D4739', '#74C69D'], ['#0A3D62', '#60A3D9'],
  ['#4A1942', '#C9579C'], ['#1A3A1A', '#76B947'], ['#5C3317', '#C4813B'],
  ['#1B3A5C', '#5899D8'], ['#3B1F2B', '#C06D8A'], ['#1C3D2E', '#4CA37A'],
];
function coverColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return COVERS[Math.abs(h) % COVERS.length];
}

function stokInfo(stock: number) {
  if (stock > 3) return { label: 'Tersedia',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' };
  if (stock > 0) return { label: 'Terbatas',  cls: 'bg-amber-50  text-amber-700  border-amber-200',   dot: 'bg-amber-400'  };
  return           { label: 'Habis',     cls: 'bg-rose-50   text-rose-700   border-rose-200',     dot: 'bg-rose-400'   };
}

/* ════════════════════════════════════════════════════════════════════════ */
export default async function BukuPublikPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  /* Ambil data buku dari Supabase */
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) notFound();

  /* Cek status login dari cookie */
  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;   // 'admin' | 'user' | undefined
  const userEmail = cookieStore.get('user_email')?.value;
  const isLoggedIn = !!session && !!userEmail;

  const [bg, ac] = coverColor(id);
  const stok = stokInfo(book.stock ?? 0);

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col font-sans">

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b
                         border-slate-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#1B4332]">
          <span className="text-xl">📚</span>
          <div>
            <p className="font-black text-sm leading-none">E-PERPUS</p>
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
              Kejaksaan Negeri Soppeng
            </p>
          </div>
        </Link>

        {isLoggedIn ? (
          <Link
            href="/katalog"
            className="text-[10px] font-black text-[#1B4332] bg-emerald-50
                       border border-emerald-200 px-3 py-1.5 rounded-lg uppercase tracking-widest"
          >
            ← Katalog
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-[10px] font-black text-white bg-[#1B4332]
                       px-3 py-1.5 rounded-lg uppercase tracking-widest"
          >
            Login
          </Link>
        )}
      </header>

      {/* ── HERO COVER ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-6 pt-10 pb-16 flex flex-col
                   items-center text-center"
        style={{ background: `linear-gradient(160deg, ${bg} 0%, ${ac}66 100%)` }}
      >
        {/* Spine accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 opacity-50"
          style={{ background: ac }}
        />

        {/* Kategori badge */}
        <span className="inline-block mb-4 px-3 py-1 bg-white/20 backdrop-blur-sm
                         border border-white/30 text-white text-[10px] font-black
                         uppercase tracking-widest rounded-full">
          {book.category || 'Umum'}
        </span>

        {/* Judul */}
        <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight
                       max-w-xs sm:max-w-md drop-shadow-lg mb-2">
          {book.title}
        </h1>

        {book.author && (
          <p className="text-white/75 text-sm font-medium mt-1">
            oleh {book.author}
          </p>
        )}
        {book.publisher && (
          <p className="text-white/50 text-xs mt-0.5">{book.publisher}</p>
        )}

        {/* Status stok */}
        <span className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5
                         rounded-full border text-xs font-black bg-white ${stok.cls}`}>
          <span className={`w-2 h-2 rounded-full ${stok.dot}`} />
          {stok.label} · {book.stock ?? 0} tersedia
        </span>
      </div>

      {/* ── CARD UTAMA ───────────────────────────────────────────────── */}
      <main className="flex-1 px-4 -mt-6 max-w-lg mx-auto w-full pb-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Info grid */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
            <div className="p-4 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rak</p>
              <p className="font-black text-slate-800 text-sm">{book.rak || '—'}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stok</p>
              <p className={`font-black text-sm ${(book.stock ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {book.stock ?? 0} pcs
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ISBN</p>
              <p className="font-black text-slate-800 text-[11px] break-all">
                {book.nomor_buku || '—'}
              </p>
            </div>
          </div>

          {/* Ringkasan */}
          {book.ringkasan && (
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Ringkasan
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{book.ringkasan}</p>
            </div>
          )}

          {/* ── AKSI ─────────────────────────────────────────────────── */}
          <div className="p-5 space-y-3">

            {/* Baca E-Book */}
            {book.pdf_url ? (
              <a
                href={book.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5
                           bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200
                           rounded-2xl font-black text-xs uppercase tracking-widest
                           transition-all active:scale-95"
              >
                <span className="text-base">📖</span> Baca E-Book
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full py-3.5
                              bg-slate-50 text-slate-400 border border-dashed border-slate-200
                              rounded-2xl font-black text-xs uppercase tracking-widest">
                <span>🔒</span> E-Book Belum Tersedia
              </div>
            )}

            {/* Pinjam / Login */}
            {isLoggedIn ? (
              <Link
                href="/katalog"
                className="flex items-center justify-center gap-2 w-full py-3.5
                           bg-gradient-to-r from-[#1B4332] to-emerald-600
                           hover:from-[#143326] hover:to-emerald-700 text-white
                           rounded-2xl font-black text-xs uppercase tracking-widest
                           shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
              >
                <span className="text-base">📚</span> Pinjam di Katalog
              </Link>
            ) : (
              <Link
                href={`/login?redirect=/buku/${id}`}
                className="flex items-center justify-center gap-2 w-full py-3.5
                           bg-gradient-to-r from-[#1B4332] to-emerald-600
                           hover:from-[#143326] hover:to-emerald-700 text-white
                           rounded-2xl font-black text-xs uppercase tracking-widest
                           shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
              >
                <span className="text-base">🔐</span> Login untuk Pinjam
              </Link>
            )}
          </div>

          {/* ID footer */}
          <p className="text-center text-[9px] text-slate-300 font-mono pb-4 px-5">
            ID: {book.id}
          </p>
        </div>

        <p className="text-center mt-4">
          <Link
            href="/katalog"
            className="text-xs text-slate-400 hover:text-[#1B4332] font-bold transition-colors"
          >
            ← Lihat Katalog Lengkap
          </Link>
        </p>
      </main>
    </div>
  );
}