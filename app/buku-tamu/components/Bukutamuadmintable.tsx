'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import ExportBukuTamu from './ExportBukuTamu';

type BukuTamuEntry = {
  id: string;
  nama: string;
  bidang?: string | null;
  asal_instansi?: string | null;
  keperluan: string;
  pesan?: string | null;
  ttd_data?: string | null;
  status: string;
  created_at: string;
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getBidang(e: BukuTamuEntry) {
  return e.bidang || e.asal_instansi || '—';
}

// ── Baris entri ───────────────────────────────────────────────
function EntryRow({ entry, no }: { entry: BukuTamuEntry; no: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showTtd, setShowTtd] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await supabase.from('buku_tamu').update({ status: 'approved' }).eq('id', entry.id);
    router.refresh(); setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await supabase.from('buku_tamu').update({ status: 'rejected' }).eq('id', entry.id);
    router.refresh(); setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await supabase.from('buku_tamu').delete().eq('id', entry.id);
    setShowDel(false); router.refresh(); setLoading(false);
  };

  const statusBadge: Record<string, string> = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
        {/* No */}
        <td className="px-3 py-3 text-center">
          <span className="text-[10px] font-black text-slate-400 tabular-nums">
            {String(no).padStart(3, '0')}
          </span>
        </td>

        {/* Tanggal */}
        <td className="px-3 py-3">
          <p className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{formatTanggal(entry.created_at)}</p>
        </td>

        {/* Nama */}
        <td className="px-3 py-3">
          <p className="font-black text-slate-800 text-sm leading-snug">{entry.nama}</p>
        </td>

        {/* Bidang */}
        <td className="px-3 py-3">
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">
            {getBidang(entry)}
          </span>
        </td>

        {/* Keperluan */}
        <td className="px-3 py-3">
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-black text-emerald-700 uppercase tracking-wider whitespace-nowrap">
            {entry.keperluan}
          </span>
        </td>

        {/* Kritik/Saran */}
        <td className="px-3 py-3 max-w-[180px]">
          {entry.pesan ? (
            <p className="text-xs text-slate-500 font-medium italic line-clamp-2">
              &ldquo;{entry.pesan}&rdquo;
            </p>
          ) : (
            <span className="text-[9px] text-slate-300 font-bold">—</span>
          )}
        </td>

        {/* TTD */}
        <td className="px-3 py-3 text-center">
          {entry.ttd_data ? (
            <button
              onClick={() => setShowTtd(true)}
              className="group relative"
              title="Lihat tanda tangan"
            >
              <img
                src={entry.ttd_data}
                alt="TTD"
                className="h-8 w-20 object-contain border border-slate-200 rounded-lg bg-white hover:border-[#1B4332] transition-colors"
              />
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] font-black text-[#1B4332] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Perbesar
              </span>
            </button>
          ) : (
            <span className="text-[9px] text-slate-300 font-bold">—</span>
          )}
        </td>

        {/* Status */}
        <td className="px-3 py-3">
          <span className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusBadge[entry.status] ?? 'bg-slate-50 text-slate-500 border-slate-100'}`}>
            {entry.status}
          </span>
        </td>

        {/* Aksi */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-1.5">
            {entry.status !== 'approved' && (
              <button disabled={loading} onClick={handleApprove}
                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50">
                ACC
              </button>
            )}
            {entry.status !== 'rejected' && (
              <button disabled={loading} onClick={handleReject}
                className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-amber-100 transition-colors disabled:opacity-50">
                Tolak
              </button>
            )}
            <button disabled={loading} onClick={() => setShowDel(true)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
              title="Hapus">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Modal lihat TTD */}
      {showTtd && entry.ttd_data && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTtd(false)}>
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Tanda Tangan — {entry.nama}</p>
            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50">
              <img src={entry.ttd_data} alt="TTD" className="w-full object-contain max-h-36" />
            </div>
            <button onClick={() => setShowTtd(false)} className="mt-5 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors tracking-widest">
              Tutup
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Modal hapus */}
      {showDel && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">🗑️</div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Hapus Entri?</h4>
            <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed">
              Entri dari <span className="font-bold text-slate-800">"{entry.nama}"</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button disabled={loading} onClick={() => setShowDel(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all tracking-widest">
                Batal
              </button>
              <button disabled={loading} onClick={handleDelete}
                className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-red-700 transition-all tracking-widest disabled:opacity-60">
                {loading ? '...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Tabel Admin ───────────────────────────────────────────────
export default function BukuTamuAdminTable({ entries }: { entries: BukuTamuEntry[] }) {
  const [filter, setFilter] = useState<'semua' | 'approved' | 'pending' | 'rejected'>('semua');
  const [search, setSearch] = useState('');

 const safeEntries = entries || [];

  const filtered = safeEntries
    .filter((e) => filter === 'semua' || e.status === filter)
    .filter((e) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.nama.toLowerCase().includes(q) ||
        e.keperluan.toLowerCase().includes(q) ||
        getBidang(e).toLowerCase().includes(q) ||
        (e.pesan?.toLowerCase().includes(q) ?? false)
      );
    });

  const counts = {
    semua: safeEntries.length,
    pending: safeEntries.filter((e) => e.status === 'pending').length,
    approved: safeEntries.filter((e) => e.status === 'approved').length,
    rejected: safeEntries.filter((e) => e.status === 'rejected').length,
  };

  const tabs = [
    { key: 'semua' as const, label: 'Semua', color: 'bg-slate-800 text-white' },
    { key: 'pending' as const, label: 'Pending', color: 'bg-amber-500 text-white' },
    { key: 'approved' as const, label: 'Disetujui', color: 'bg-emerald-600 text-white' },
    { key: 'rejected' as const, label: 'Ditolak', color: 'bg-red-500 text-white' },
  ];

  return (
    <div className="space-y-4">
      {/* Header card: filter + export + search */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col gap-4">

          {/* Row 1: Judul + Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800">Data Kunjungan Buku Tamu</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {filtered.length} dari {entries.length} entri ditampilkan
              </p>
            </div>
            <ExportBukuTamu entries={filter === 'semua' ? safeEntries : filtered} />
          </div>

          {/* Row 2: Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === t.key ? t.color + ' shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t.label}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  filter === t.key ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                }`}>
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Row 3: Search */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, keperluan, bidang..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-3xl mb-3">📖</p>
              <p className="font-bold text-sm">Tidak ada entri di kategori ini</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['No', 'Tanggal', 'Nama', 'Bidang', 'Keperluan / Tujuan', 'Kritik / Saran', 'TTD', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <EntryRow key={entry.id} entry={entry} no={i + 1} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer tabel */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Menampilkan {filtered.length} entri • {counts.approved} disetujui • {counts.pending} pending • {counts.rejected} ditolak
            </p>
          </div>
        )}
      </div>
    </div>
  );
}