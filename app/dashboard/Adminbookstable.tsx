'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import EditBookModal from './EditBookModal';
import DeleteBookButton from './DeleteBookButton';
import QRCodeModal from './QRCodeModal';

type Book = {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  category?: string;
  nomor_buku?: string;
  stock: number;
  rak?: string;
  pdf_url?: string;
  bidang_bb?: string;
  ringkasan?: string;
  rating?: number;
  rating_count?: number;
  created_at?: string;
};

const ITEMS_PER_PAGE = 15;

// ── Skeleton row ──────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-4 py-3.5"><div className="h-3 w-5 bg-slate-200 rounded" /></td>
      <td className="px-4 py-3.5">
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-200 rounded w-40" />
          <div className="h-2 w-10 bg-slate-100 rounded" />
        </div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3 w-28 bg-slate-200 rounded" /></td>
      <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-5 w-16 bg-slate-100 rounded-lg" /></td>
      <td className="px-4 py-3.5 hidden sm:table-cell"><div className="h-3 w-8 bg-slate-200 rounded" /></td>
      <td className="px-4 py-3.5"><div className="h-5 w-8 bg-slate-100 rounded-lg" /></td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          <div className="h-7 w-20 bg-slate-200 rounded-xl" />
          <div className="h-7 w-10 bg-slate-100 rounded-lg" />
          <div className="h-7 w-10 bg-slate-100 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

// ── Mobile action bar (shown below title on small screens) ────
function MobileActions({ book }: { book: Book }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 sm:hidden">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="1"/><circle cx="10" cy="6" r="1"/><circle cx="2" cy="6" r="1"/></svg>
        Aksi {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5 bg-slate-50 rounded-xl p-2 border border-slate-100">
          <QRCodeModal book={book} />
          <EditBookModal book={book} />
          <DeleteBookButton bookId={book.id} bookTitle={book.title} />
        </div>
      )}
    </div>
  );
}

export default function AdminBooksTable({ books }: { books: Book[] }) {
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('');
  const [bbFilter,     setBbFilter]     = useState('');
  const [page,         setPage]         = useState(1);
  const [sortKey,      setSortKey]      = useState<'title' | 'stock' | 'created_at'>('created_at');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [isTransition, setIsTransition] = useState(false);
  const firstRender = useRef(true);

  const categories = useMemo(
    () => Array.from(new Set(books.map((b) => b.category).filter(Boolean))) as string[],
    [books]
  );
  const bidangBBList = useMemo(
    () => Array.from(new Set(books.map((b) => b.bidang_bb).filter(Boolean))) as string[],
    [books]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return books
      .filter((b) => {
        if (catFilter && b.category !== catFilter) return false;
        if (bbFilter  && b.bidang_bb !== bbFilter)  return false;
        if (!q) return true;
        return (
          b.title.toLowerCase().includes(q) ||
          (b.author?.toLowerCase().includes(q) ?? false) ||
          (b.category?.toLowerCase().includes(q) ?? false) ||
          (b.nomor_buku?.toLowerCase().includes(q) ?? false) ||
          (b.bidang_bb?.toLowerCase().includes(q) ?? false) ||
          (b.ringkasan?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        let valA: any = a[sortKey] ?? '';
        let valB: any = b[sortKey] ?? '';
        if (sortKey === 'stock') { valA = Number(valA); valB = Number(valB); }
        else { valA = String(valA).toLowerCase(); valB = String(valB).toLowerCase(); }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1  : -1;
        return 0;
      });
  }, [books, search, catFilter, bbFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const resetPage  = () => setPage(1);

  const toggleSort = (key: typeof sortKey) => {
    triggerTransition();
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const triggerTransition = () => {
    setIsTransition(true);
    setTimeout(() => setIsTransition(false), 350);
  };

  const changePage = (p: number) => {
    triggerTransition();
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    triggerTransition();
  }, [search, catFilter, bbFilter]);

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey === col ? (
      <span className="ml-1 text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : (
      <span className="ml-1 text-[10px] text-slate-300">↕</span>
    );

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Cari judul, penulis, kategori, nomor, ringkasan..."
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1B4332] transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); resetPage(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xl leading-none"
            >×</button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); resetPage(); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1B4332] cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {bidangBBList.length > 0 && (
            <select
              value={bbFilter}
              onChange={(e) => { setBbFilter(e.target.value); resetPage(); }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1B4332] cursor-pointer"
            >
              <option value="">Semua Bidang BB</option>
              {bidangBBList.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          {(catFilter || bbFilter || search) && (
            <button
              onClick={() => { setSearch(''); setCatFilter(''); setBbFilter(''); resetPage(); }}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
            >
              Reset
            </button>
          )}
          <span className="ml-auto text-[10px] font-bold text-slate-400">
            {filtered.length} dari {books.length} buku
            {totalPages > 1 && ` · Hal ${safePage}/${totalPages}`}
          </span>
        </div>
      </div>

      {/* ── Tabel ── */}
      <div
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity duration-300"
        style={{ opacity: isTransition ? 0.4 : 1 }}
      >
        {pageSlice.length === 0 && !isTransition ? (
          <div className="py-20 text-center">
            <p className="text-3xl mb-3">📚</p>
            <p className="font-bold text-slate-500">Tidak ada buku yang cocok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest w-10">#</th>
                  <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <button onClick={() => toggleSort('title')} className="flex items-center hover:text-slate-700 transition-colors">
                      Judul <SortIcon col="title" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Penulis / Penerbit</th>
                  <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Rak</th>
                  <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <button onClick={() => toggleSort('stock')} className="flex items-center hover:text-slate-700 transition-colors">
                      Stok <SortIcon col="stock" />
                    </button>
                  </th>
                  {/* Aksi — selalu tampil, termasuk mobile */}
                  <th className="text-right px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isTransition
                  ? Array.from({ length: Math.min(ITEMS_PER_PAGE, 10) }).map((_, i) => <SkeletonRow key={i} />)
                  : pageSlice.map((book, i) => (
                    <tr key={book.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Nomor */}
                      <td className="px-4 py-3.5 text-[10px] font-black text-slate-400 tabular-nums align-top">
                        {(safePage - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>

                      {/* Judul + mobile actions */}
                      <td className="px-4 py-3.5 max-w-[200px] align-top">
                        <p className="font-bold text-slate-800 text-xs leading-snug line-clamp-2">{book.title}</p>
                        {book.nomor_buku && (
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">#{book.nomor_buku}</p>
                        )}
                        {book.category && (
                          <span className="lg:hidden inline-block mt-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black uppercase tracking-wide">
                            {book.category}
                          </span>
                        )}
                        {book.ringkasan && (
                          <p className="mt-1 text-[9px] text-slate-400 font-medium line-clamp-1 italic">
                            {book.ringkasan.substring(0, 60)}…
                          </p>
                        )}
                        {/* ── Mobile actions (selalu terlihat di hp) ── */}
                        <MobileActions book={book} />
                      </td>

                      {/* Penulis */}
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium hidden md:table-cell max-w-[140px] align-top">
                        <span className="line-clamp-1">{book.author || '—'}</span>
                        {book.publisher && (
                          <span className="block text-[9px] text-slate-400 mt-0.5 line-clamp-1">{book.publisher}</span>
                        )}
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3.5 hidden lg:table-cell align-top">
                        {book.category ? (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-wide whitespace-nowrap">
                            {book.category}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                        {book.pdf_url ? (
                          <span className="mt-1 block px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[8px] font-black uppercase tracking-wide w-fit">
                            📄 E-Book
                          </span>
                        ) : (
                          <span className="mt-1 block px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[8px] font-black uppercase tracking-wide w-fit">
                            ⚠ No PDF
                          </span>
                        )}
                      </td>

                      {/* Rak */}
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-bold hidden sm:table-cell align-top">
                        {book.rak ? (
                          <span className="flex items-center gap-1">
                            <span className="text-emerald-500">📍</span>{book.rak}
                          </span>
                        ) : '—'}
                        {(book.rating ?? 0) > 0 && (
                          <span className="block text-[9px] text-amber-500 font-black mt-0.5">
                            ★ {Number(book.rating).toFixed(1)}
                            {book.rating_count ? ` (${book.rating_count})` : ''}
                          </span>
                        )}
                      </td>

                      {/* Stok */}
                      <td className="px-4 py-3.5 align-top">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                          book.stock > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {book.stock}
                        </span>
                      </td>

                      {/* Aksi — hidden di mobile (pakai MobileActions di atas) */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="hidden sm:flex items-center justify-end gap-1.5 flex-wrap">
                          <QRCodeModal book={book} />
                          <EditBookModal book={book} />
                          <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Buku {(safePage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={safePage <= 1}
                onClick={() => changePage(Math.max(1, safePage - 1))}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← Prev
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    return p === 1 || p === totalPages || Math.abs(p - safePage) <= 2;
                  })
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-slate-400 text-xs px-0.5">…</span>
                      )}
                      <button
                        onClick={() => changePage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          p === safePage
                            ? 'bg-[#1B4332] text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>

              <button
                disabled={safePage >= totalPages}
                onClick={() => changePage(Math.min(totalPages, safePage + 1))}
                className="px-4 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-bold hover:bg-[#123023] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}