import { supabase } from '../../lib/supabase';
import ReturnButton from './ReturnButton';
import AddBookModal from './AddBookModal';
import UserAction from './UserAction';
import DeleteBookButton from './DeleteBookButton';
import EditBookModal from './EditBookModal';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileMenu from '../ProfileMenu';
import Link from 'next/link';
import AIAssistant from '../AIAssistant';
import ExportLaporan from './ExportLaporan';
import BacaPDFModal from './BacaPDFModal';
import ScanBukuModal from './ScanBukuModal';
import QRCodeModal from './QRCodeModal';

export const revalidate = 0;

// ── Helper: warna badge status ─────────────────────────────────────────────
function loanBadge(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'DIPINJAM')     return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s === 'TERLAMBAT')    return 'bg-rose-50 text-rose-700 border-rose-200';
  if (s === 'DIKEMBALIKAN') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'SUDAH DIULAS') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

// ── Helper: badge sumber peminjaman ────────────────────────────────────────
function SourceBadge({ via }: { via?: string | null }) {
  if (via === 'AI_LEXI') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
        🤖 Lexi
      </span>
    );
  }
  if (via === 'KATALOG') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-slate-50 text-slate-500 border border-slate-100">
        📚 Katalog
      </span>
    );
  }
  return null;
}

export default async function DashboardPage(props: any) {
  const searchParams = await props.searchParams;
  const activeTab    = searchParams?.tab         || 'overview';
  // Filter sirkulasi: 'semua' | 'DIPINJAM' | 'DIKEMBALIKAN' | 'ai_only'
  const sirkulasiFilter = searchParams?.filter   || 'semua';

  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Admin';

  if (session !== 'admin') redirect('/login');

  // ── Fetch semua data ───────────────────────────────────────────────────
  // FIX: ganti loan_date → created_at
  const { data: loans }    = await supabase
    .from('loans')
    .select('*, books(title, stock, category, rak)')
    .order('created_at', { ascending: false });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  // ── Statistik ──────────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const totalBooks    = books?.length || 0;
  const activeLoans   = loans?.filter(l => l.status?.toUpperCase() === 'DIPINJAM').length || 0;
  const returnedLoans = loans?.filter(l => ['DIKEMBALIKAN','SUDAH DIULAS'].includes(l.status?.toUpperCase())).length || 0;
  const pendingUsers  = profiles?.filter(p => p.status === 'pending').length || 0;
  const overdueLoans  = loans?.filter(l => l.status?.toUpperCase() === 'DIPINJAM' && new Date(l.due_date) < today) || [];
  const outOfStock    = books?.filter(b => b.stock <= 0) || [];
  const viaAILoans    = loans?.filter(l => l.borrowed_via === 'AI_LEXI') || [];

  const returnRate = loans && loans.length > 0
    ? Math.round((returnedLoans / loans.length) * 100) : 0;

  // Top readers & kategori
  const readerMap: Record<string, number> = {};
  loans?.forEach(l => { readerMap[l.employee_name] = (readerMap[l.employee_name] || 0) + 1; });
  const topReaders = Object.entries(readerMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const catMap: Record<string, number> = {};
  books?.forEach(b => { const c = b.category || 'Lainnya'; catMap[c] = (catMap[c] || 0) + 1; });
  const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ── Filter sirkulasi ───────────────────────────────────────────────────
  const filteredLoans = (loans || []).filter(l => {
    if (sirkulasiFilter === 'DIPINJAM')    return l.status?.toUpperCase() === 'DIPINJAM';
    if (sirkulasiFilter === 'DIKEMBALIKAN') return ['DIKEMBALIKAN','SUDAH DIULAS'].includes(l.status?.toUpperCase());
    if (sirkulasiFilter === 'ai_only')     return l.borrowed_via === 'AI_LEXI';
    return true; // semua
  });

  // Enrich: tambahkan status TERLAMBAT secara visual (tidak write ke DB)
  const enrichedLoans = filteredLoans.map(l => ({
    ...l,
    _isLate: l.status?.toUpperCase() === 'DIPINJAM' && new Date(l.due_date) < today,
  }));

  // ── Nav items ──────────────────────────────────────────────────────────
  const navItems = [
    { tab: 'overview',  icon: '📊', label: 'Ringkasan',    badge: 0 },
    { tab: 'buku',      icon: '📚', label: 'Katalog Buku', badge: 0 },
    { tab: 'sirkulasi', icon: '🔄', label: 'Sirkulasi',    badge: overdueLoans.length },
    { tab: 'pegawai',   icon: '👥', label: 'Pegawai',      badge: pendingUsers },
  ];

  // ── Filter tabs untuk sirkulasi ────────────────────────────────────────
  const sirkulasiTabs = [
    { key: 'semua',        label: 'Semua',        count: loans?.length || 0 },
    { key: 'DIPINJAM',     label: 'Aktif',        count: activeLoans },
    { key: 'DIKEMBALIKAN', label: 'Dikembalikan', count: returnedLoans },
    { key: 'ai_only',      label: '🤖 Via Lexi',  count: viaAILoans.length },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F4] text-slate-800 font-sans overflow-hidden">

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-slate-200/60 z-50 flex-shrink-0">
        <div className="h-20 flex items-center gap-4 px-7 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0f2e22] to-[#1B4332] rounded-xl flex items-center justify-center shadow-lg ring-2 ring-emerald-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">E-Perpus</h1>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Administrator</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Panel Kontrol</p>
          {navItems.map(item => {
            const isActive = activeTab === item.tab;
            return (
              <Link
                key={item.tab}
                href={`?tab=${item.tab}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-md shadow-[#1B4332]/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`text-base transition-transform ${isActive ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Akses Cepat</p>
            <Link href="/katalog" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group">
              <span className="text-base grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100">🌐</span>
              <span>Lihat Katalog</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 bg-[#1B4332] text-white rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-800 truncate">{userEmail}</p>
              <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          AREA KANAN
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 z-40 flex-shrink-0">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B4332] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px]">EP</span>
            </div>
            <h1 className="text-sm font-black uppercase text-slate-800">Dasbor Admin</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-base font-black text-slate-800">
              {navItems.find(n => n.tab === activeTab)?.label || 'Dasbor'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ScanBukuModal isLoggedIn={true} />
            </div>
            <ProfileMenu email={userEmail} role={session} />
          </div>
        </header>

        {/* ── Main Content ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-10 scroll-smooth">
          <div className="max-w-[1300px] mx-auto">

            {/* ════════════════════════
                TAB: OVERVIEW
            ════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Hero Banner */}
                <div className="bg-gradient-to-br from-[#0f2e22] via-[#1B4332] to-[#255940] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-[#3b7a5d]/30">
                  <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-[60px] pointer-events-none" />
                  <div className="absolute top-6 right-6 opacity-[0.06] text-[7rem] leading-none pointer-events-none select-none font-black">⚖</div>
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4 border border-white/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Panel Admin Aktif
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-1">
                      Selamat Datang,<br />
                      <span className="text-emerald-300">Administrator!</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="relative z-10 w-full lg:w-auto">
                    <ExportLaporan dataBuku={books || []} dataPinjam={loans || []} />
                  </div>
                </div>

                {/* Stat Cards — 4 kartu + 1 AI card */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Koleksi',   value: totalBooks,       icon: '📚', color: 'blue',    sub: `${outOfStock.length} stok habis` },
                    { label: 'Aktif Dipinjam',  value: activeLoans,      icon: '⏳', color: 'amber',   sub: `${overdueLoans.length} terlambat` },
                    { label: 'Tingkat Kembali', value: `${returnRate}%`, icon: '✅', color: 'emerald', sub: `${returnedLoans} total` },
                    { label: 'Perlu ACC',        value: pendingUsers,     icon: '👥', color: 'violet',  sub: 'akun baru' },
                  ].map(stat => {
                    const colors: Record<string, string> = {
                      blue:    'from-blue-50 to-blue-100/50 text-blue-500',
                      amber:   'from-amber-50 to-amber-100/50 text-amber-500',
                      emerald: 'from-emerald-50 to-emerald-100/50 text-emerald-600',
                      violet:  'from-violet-50 to-violet-100/50 text-violet-500',
                    };
                    return (
                      <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-2xl ${colors[stat.color]}`}>
                          {stat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-2xl font-black text-slate-800 leading-none">{stat.value}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                          <p className="text-[9px] font-medium text-slate-400 mt-0.5">{stat.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Card Lexi AI — full-width highlight */}
                <div className="bg-gradient-to-r from-emerald-950 to-[#1B4332] rounded-2xl border border-emerald-800/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Lexi AI — Asisten Perpustakaan</p>
                      <p className="text-xl font-black text-white mt-0.5">{viaAILoans.length} peminjaman via chatbot</p>
                      <p className="text-[11px] text-emerald-200/60 font-medium mt-0.5">
                        {viaAILoans.filter(l => l.status?.toUpperCase() === 'DIPINJAM').length} masih aktif ·{' '}
                        {viaAILoans.filter(l => l.status?.toUpperCase() !== 'DIPINJAM').length} selesai
                      </p>
                    </div>
                  </div>
                  <Link
                    href="?tab=sirkulasi&filter=ai_only"
                    className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Lihat Semua →
                  </Link>
                </div>

                {/* Peringatan & Inventaris */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Terlambat */}
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                        <span className="w-8 h-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-base">🚨</span>
                        Terlambat Kembali
                      </h3>
                      {overdueLoans.length > 0 && (
                        <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-2 py-1 rounded-full">
                          {overdueLoans.length} item
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                      {overdueLoans.length === 0 ? (
                        <div className="py-10 text-center text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100 border-dashed">
                          ✅ Semua sirkulasi berjalan lancar
                        </div>
                      ) : overdueLoans.map(loan => {
                        const daysLate = Math.floor((Date.now() - new Date(loan.due_date).getTime()) / 86400000);
                        return (
                          <div key={loan.id} className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-xl gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-slate-800 text-sm truncate">{loan.employee_name}</p>
                                <SourceBadge via={loan.borrowed_via} />
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{loan.books?.title}</p>
                              <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider mt-1">
                                {daysLate} hari terlambat
                              </p>
                            </div>
                            <Link
                              href="?tab=sirkulasi"
                              className="text-[9px] font-black bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-colors uppercase tracking-widest flex-shrink-0"
                            >
                              Tindak
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stok Habis */}
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                        <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-base">⚠️</span>
                        Stok Habis
                      </h3>
                      {outOfStock.length > 0 && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
                          {outOfStock.length} buku
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                      {outOfStock.length === 0 ? (
                        <div className="py-10 text-center text-sm font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                          Inventaris terkendali
                        </div>
                      ) : outOfStock.map(book => (
                        <div key={book.id} className="flex items-center justify-between p-4 bg-amber-50/40 border border-amber-100 rounded-xl gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm line-clamp-1">{book.title}</p>
                            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mt-1">{book.category}</p>
                          </div>
                          <span className="w-8 h-8 bg-amber-100 text-amber-700 border border-amber-200 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leaderboard & Kategori */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Readers */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5 text-sm">
                      <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-base">🏆</span>
                      Pegawai Teraktif
                    </h3>
                    <div className="space-y-3">
                      {topReaders.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">Belum ada data.</p>
                      ) : topReaders.map(([name, count], i) => (
                        <div key={name} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-200 text-yellow-900 border border-yellow-300'
                            : i === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>{i + 1}</div>
                          <p className="flex-1 text-sm font-bold text-slate-700 truncate">{name}</p>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-black text-[#1B4332]">{count}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">buku</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distribusi Kategori */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5 text-sm">
                      <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-base">📊</span>
                      Distribusi Kategori
                    </h3>
                    <div className="space-y-4">
                      {topCategories.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">Katalog kosong.</p>
                      ) : topCategories.map(([cat, count]) => {
                        const pct = Math.round((count / totalBooks) * 100);
                        return (
                          <div key={cat}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{cat}</span>
                              <span className="text-[9px] font-black text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-md">
                                {count} · {pct}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-gradient-to-r from-[#1B4332] to-emerald-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════
                TAB: KATALOG BUKU
            ════════════════════════ */}
            {activeTab === 'buku' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">📚 Database Katalog Buku</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {totalBooks} judul terdaftar · Kelola stok, rak, dan cetak QR Code
                    </p>
                  </div>
                  <AddBookModal />
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-slate-50">
                  {books?.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm font-bold">Belum ada buku.</div>
                  ) : books?.map(book => (
                    <div key={book.id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 leading-snug">{book.title}</p>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200">{book.category}</span>
                            <span className="text-[8px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-100">📍 {book.rak || 'TBA'}</span>
                          </div>
                        </div>
                        <div className={`text-xl font-black flex-shrink-0 ${book.stock > 0 ? 'text-[#1B4332]' : 'text-rose-500'}`}>
                          {book.stock}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                        <BacaPDFModal url={book.pdf_url} compact />
                        <QRCodeModal book={book} />
                        <EditBookModal book={book} />
                        <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Judul & Kategori', 'Penulis / Penerbit', 'Rak · Rating', 'Stok', 'Aksi'].map(h => (
                          <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {books?.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-16 text-slate-400 text-sm">Belum ada buku. Klik Tambah Buku Baru.</td></tr>
                      ) : books?.map(book => (
                        <tr key={book.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 max-w-[200px] truncate">{book.title}</p>
                            <span className="inline-block mt-1 text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200">
                              {book.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-700 text-xs font-bold truncate max-w-[140px]">{book.author || '—'}</p>
                            <p className="text-slate-400 text-[10px] truncate max-w-[140px]">{book.publisher || '—'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[10px] font-black text-violet-700 bg-violet-50 inline-block px-2 py-0.5 rounded border border-violet-100 mb-1">
                              📍 {book.rak || 'TBA'}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill={i < Math.round(book.rating || 0) ? '#F59E0B' : '#E2E8F0'}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                              <span className="text-[8px] text-slate-400 font-bold ml-1">({book.rating_count || 0})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-lg font-black ${book.stock > 0 ? 'text-[#1B4332]' : 'text-rose-500'}`}>{book.stock}</span>
                            <span className="text-[9px] font-bold text-slate-400 ml-1">pcs</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <BacaPDFModal url={book.pdf_url} compact />
                              <QRCodeModal book={book} />
                              <EditBookModal book={book} />
                              <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════════════════════════
                TAB: SIRKULASI
            ════════════════════════ */}
            {activeTab === 'sirkulasi' && (
              <div className="space-y-4">

                {/* Header + Export */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-800">🔄 Log Sirkulasi Peminjaman</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {loans?.length || 0} total transaksi · {activeLoans} aktif · {overdueLoans.length} terlambat · {viaAILoans.length} via Lexi AI
                    </p>
                  </div>
                  <ExportLaporan dataBuku={books || []} dataPinjam={loans || []} />
                </div>

                {/* Stat Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Dipinjam',     value: activeLoans,          cls: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: 'Terlambat',    value: overdueLoans.length,  cls: 'bg-rose-50 border-rose-200 text-rose-700' },
                    { label: 'Dikembalikan', value: returnedLoans,        cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                    { label: '🤖 Via Lexi',  value: viaAILoans.length,    cls: 'bg-emerald-900/5 border-emerald-200 text-emerald-800' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl border p-4 text-center ${s.cls}`}>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                  {sirkulasiTabs.map(t => (
                    <Link
                      key={t.key}
                      href={`?tab=sirkulasi&filter=${t.key}`}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border transition-all ${
                        sirkulasiFilter === t.key
                          ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-md'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {t.label}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] ${
                        sirkulasiFilter === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                      }`}>{t.count}</span>
                    </Link>
                  ))}
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-slate-50">
                    {enrichedLoans.length === 0 ? (
                      <p className="p-10 text-center text-slate-400 text-sm font-bold">Tidak ada data untuk filter ini.</p>
                    ) : enrichedLoans.map(loan => (
                      <div key={loan.id} className={`p-5 space-y-3 ${loan._isLate ? 'bg-rose-50/30' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-bold text-slate-800 text-sm">{loan.employee_name}</p>
                              <SourceBadge via={loan.borrowed_via} />
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{loan.books?.title}</p>
                            {loan.user_email && (
                              <p className="text-[9px] text-slate-400 font-medium mt-0.5">{loan.user_email}</p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest flex-shrink-0 ${loanBadge(loan._isLate ? 'TERLAMBAT' : loan.status)}`}>
                            {loan._isLate ? '⚠️ Telat' : loan.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold">
                              Tenggat: <span className={`font-black ${loan._isLate ? 'text-rose-600' : 'text-slate-700'}`}>
                                {new Date(loan.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </p>
                            {loan._isLate && (
                              <p className="text-[9px] font-black text-rose-500 mt-0.5">
                                {Math.floor((Date.now() - new Date(loan.due_date).getTime()) / 86400000)} hari terlambat
                              </p>
                            )}
                          </div>
                          <ReturnButton loan={loan} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          {['Peminjam & Sumber', 'Aset Referensi', 'Tenggat', 'NIP', 'Status', 'Aksi'].map(h => (
                            <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {enrichedLoans.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-16 text-slate-400 font-bold text-sm">
                              Tidak ada data untuk filter ini.
                            </td>
                          </tr>
                        ) : enrichedLoans.map(loan => (
                          <tr key={loan.id} className={`hover:bg-slate-50/80 transition-colors ${loan._isLate ? 'bg-rose-50/20' : ''}`}>
                            {/* Peminjam + sumber */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-[#1B4332] rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                                  {loan.employee_name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 leading-none">{loan.employee_name}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <SourceBadge via={loan.borrowed_via} />
                                    {loan.user_email && (
                                      <span className="text-[8px] text-slate-400 font-medium truncate max-w-[100px]">{loan.user_email}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Buku */}
                            <td className="px-6 py-4 text-slate-600 max-w-[180px]">
                              <p className="font-medium truncate italic">"{loan.books?.title || '—'}"</p>
                              {loan.books?.rak && (
                                <p className="text-[9px] text-slate-400 mt-0.5">📍 Rak {loan.books.rak}</p>
                              )}
                            </td>

                            {/* Tenggat */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-xs font-black ${loan._isLate ? 'text-rose-600' : 'text-slate-600'}`}>
                                {loan._isLate && '⚠️ '}
                                {new Date(loan.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              {loan._isLate && (
                                <p className="text-[9px] font-black text-rose-400 mt-0.5">
                                  {Math.floor((Date.now() - new Date(loan.due_date).getTime()) / 86400000)}h terlambat
                                </p>
                              )}
                            </td>

                            {/* NIP */}
                            <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                              {loan.employee_nip || '—'}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border tracking-widest ${loanBadge(loan._isLate ? 'TERLAMBAT' : loan.status)}`}>
                                {loan._isLate ? 'Terlambat' : loan.status}
                              </span>
                            </td>

                            {/* Aksi */}
                            <td className="px-6 py-4 text-right">
                              <ReturnButton loan={loan} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Footer count */}
                    {enrichedLoans.length > 0 && (
                      <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Menampilkan {enrichedLoans.length} dari {loans?.length || 0} data
                        </p>
                        {overdueLoans.length > 0 && (
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
                            ⚠️ {overdueLoans.length} peminjaman terlambat
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════
                TAB: PEGAWAI
            ════════════════════════ */}
            {activeTab === 'pegawai' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-base font-black text-slate-800">👥 Manajemen Akses Pegawai</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {profiles?.length || 0} akun terdaftar
                      {pendingUsers > 0 && <span className="text-rose-500 font-black"> · {pendingUsers} menunggu ACC</span>}
                    </p>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-slate-50">
                  {profiles?.map(profile => (
                    <div key={profile.id} className={`p-5 space-y-3 ${profile.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#1B4332] text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">
                          {profile.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{profile.email}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                            Daftar: {new Date(profile.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <div className="flex gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                            profile.role === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>{profile.role || 'user'}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                            profile.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>{profile.status}</span>
                        </div>
                        <UserAction user={profile} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Pegawai', 'Role', 'Status', 'Tgl Daftar', 'Aksi'].map(h => (
                          <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {profiles?.map(profile => (
                        <tr key={profile.id} className={`hover:bg-slate-50/80 transition-colors ${profile.status === 'pending' ? 'bg-amber-50/20' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#1B4332] text-white rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                                {profile.email?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800">{profile.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border tracking-widest ${
                              profile.role === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>{profile.role || 'user'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border tracking-widest ${
                              profile.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>{profile.status === 'pending' ? '⏳ Pending' : '✅ Aktif'}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                            {new Date(profile.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <UserAction user={profile} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV MOBILE ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 flex justify-around items-end px-2 pt-3 pb-5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        {navItems.map(item => (
          <Link
            key={item.tab}
            href={`?tab=${item.tab}`}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all relative ${
              activeTab === item.tab ? 'text-[#1B4332]' : 'text-slate-400'
            }`}
          >
            {activeTab === item.tab && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#1B4332] rounded-full" />
            )}
            <span className={`text-xl ${activeTab === item.tab ? '' : 'grayscale opacity-50'}`}>{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      <AIAssistant />
    </div>
  );
}