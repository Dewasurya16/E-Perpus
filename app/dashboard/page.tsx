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

// === IMPORT KOMPONEN SUPER SAKTI KITA ===
import ExportLaporan from './ExportLaporan'; 
import BacaPDFModal from './BacaPDFModal'; 
import ScanBukuModal from './ScanBukuModal'; 
import QRCodeModal from './QRCodeModal'; // <--- Baru: Untuk Cetak QR

export const revalidate = 0;

export default async function DashboardPage(props: any) {
  const searchParams = await props.searchParams;
  const activeTab = searchParams?.tab || 'overview'; 

  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Admin'; 

  if (session !== 'admin') redirect('/login'); 
  
  const { data: loans } = await supabase.from('loans').select(`*, books ( title, stock, category )`).order('loan_date', { ascending: false });
  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  const { data: books } = await supabase.from('books').select('*').order('created_at', { ascending: false });

  const totalBooks = books?.length || 0;
  const activeLoans = loans?.filter(l => l.status === 'Dipinjam').length || 0;
  const pendingUsers = profiles?.filter(p => p.status === 'pending').length || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueLoans = loans?.filter(l => {
    if (l.status !== 'Dipinjam') return false;
    const dueDate = new Date(l.due_date);
    return dueDate < today;
  }) || [];

  const outOfStockBooks = books?.filter(b => b.stock <= 0) || [];

  const readerCounts: Record<string, number> = {};
  loans?.forEach(l => { readerCounts[l.employee_name] = (readerCounts[l.employee_name] || 0) + 1; });
  const topReaders = Object.entries(readerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const categoryCounts: Record<string, number> = {};
  books?.forEach(b => {
    const cat = b.category || 'Lainnya';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="flex h-screen bg-[#F4F7F6] text-slate-800 font-sans overflow-hidden selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white/90 backdrop-blur-2xl border-r border-slate-200/50 z-50 flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-24 flex items-center gap-4 px-8 border-b border-slate-100/60">
          <div className="w-11 h-11 bg-gradient-to-br from-[#0f2e22] to-[#1B4332] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 ring-2 ring-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-6 h-6 bg-white/20 rounded-full blur-md"></div>
            <span className="text-white font-black text-xs tracking-widest relative z-10">EP</span>
          </div>
          <div>
            <h1 className="text-[16px] font-black uppercase tracking-tight text-slate-900 leading-none">E-Perpus</h1>
            <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest mt-1.5">Kejaksaan RI</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto hide-scrollbar">
          <p className="px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Menu Administrator</p>
          <Link href="?tab=overview" className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all duration-300 group ${activeTab === 'overview' ? 'bg-gradient-to-r from-emerald-50/80 to-transparent border-l-4 border-[#1B4332] text-[#1B4332]' : 'text-slate-500 border-l-4 border-transparent hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className={`text-[20px] transition-transform duration-300 ${activeTab === 'overview' ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100'}`}>📊</span> 
            <span className="tracking-wide">Ringkasan</span>
          </Link>
          <Link href="?tab=pegawai" className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all duration-300 group ${activeTab === 'pegawai' ? 'bg-gradient-to-r from-emerald-50/80 to-transparent border-l-4 border-[#1B4332] text-[#1B4332]' : 'text-slate-500 border-l-4 border-transparent hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className={`text-[20px] transition-transform duration-300 ${activeTab === 'pegawai' ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100'}`}>👥</span> 
            <span className="tracking-wide">Pegawai</span>
            {pendingUsers > 0 && <span className="ml-auto w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>}
          </Link>
          <Link href="?tab=sirkulasi" className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all duration-300 group ${activeTab === 'sirkulasi' ? 'bg-gradient-to-r from-emerald-50/80 to-transparent border-l-4 border-[#1B4332] text-[#1B4332]' : 'text-slate-500 border-l-4 border-transparent hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className={`text-[20px] transition-transform duration-300 ${activeTab === 'sirkulasi' ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100'}`}>🔄</span> 
            <span className="tracking-wide">Sirkulasi</span>
          </Link>
          <Link href="?tab=buku" className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all duration-300 group ${activeTab === 'buku' ? 'bg-gradient-to-r from-emerald-50/80 to-transparent border-l-4 border-[#1B4332] text-[#1B4332]' : 'text-slate-500 border-l-4 border-transparent hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className={`text-[20px] transition-transform duration-300 ${activeTab === 'buku' ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100'}`}>📚</span> 
            <span className="tracking-wide">Katalog Buku</span>
          </Link>
        </nav>
      </aside>

      {/* AREA KANAN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 sm:h-20 bg-white/60 backdrop-blur-xl border-b border-white flex items-center justify-between lg:justify-end px-4 sm:px-10 z-40 flex-shrink-0 shadow-sm">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1B4332] to-[#2d6a4f] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-[10px]">EP</span>
            </div>
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-800">Dasbor</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              {/* SCANNER DI PASANG DI HEADER AGAR BISA DIAKSES KAPAN SAJA */}
             <ScanBukuModal isLoggedIn={true} />
            </div>
            <ProfileMenu email={userEmail} role={session} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 pb-28 lg:pb-12 scroll-smooth">
          <div className="max-w-[1300px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* ========================================================= */}
            {/* TAB 1: OVERVIEW */}
            {/* ========================================================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6 sm:space-y-10">
                <div className="bg-gradient-to-br from-[#0f2e22] via-[#1B4332] to-[#255940] rounded-[2rem] p-8 sm:p-14 text-white shadow-[0_20px_40px_rgba(27,67,50,0.2)] relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-[#3b7a5d]/30">
                  <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase mb-5 backdrop-blur-md border border-white/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Sistem Pintar Aktif
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight leading-tight">Selamat Datang,<br/>Administrator!</h2>
                  </div>

                  {/* TOMBOL CETAK LAPORAN SEKARANG SUDAH BERFUNGSI! */}
                  <ExportLaporan dataBuku={books || []} dataPinjam={loans || []} />
                </div>

                {/* Kotak Statistik Dasar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-200/60 flex justify-between items-center group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300">
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Total Koleksi</p>
                      <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{totalBooks}</p>
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-500 rounded-[1.2rem] flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-inner">📚</div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-200/60 flex justify-between items-center group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300">
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Buku Dipinjam</p>
                      <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{activeLoans}</p>
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-500 rounded-[1.2rem] flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 shadow-inner">⏳</div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-200/60 flex justify-between items-center group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300">
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Perlu ACC</p>
                      <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{pendingUsers}</p>
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-500 rounded-[1.2rem] flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-inner">👥</div>
                  </div>
                </div>

                {/* Notifikasi Pintar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                       <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-3">
                         <span className="w-10 h-10 bg-rose-100 text-rose-600 rounded-[14px] flex items-center justify-center text-xl shadow-inner">🚨</span> 
                         Buku Telat Kembali
                       </h3>
                    </div>
                    <div className="p-5 sm:p-8 space-y-4 bg-slate-50/30 sm:bg-white">
                      {overdueLoans.length === 0 ? (
                         <div className="text-center p-8 bg-emerald-50/50 rounded-2xl border border-emerald-100 border-dashed text-emerald-600 text-sm font-bold">Semua sirkulasi berjalan lancar.</div>
                      ) : (
                        overdueLoans.map((loan) => (
                          <div key={loan.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 sm:p-5 bg-white border-l-4 border-l-rose-500 border border-slate-100 shadow-sm rounded-xl gap-3">
                            <div>
                              <p className="font-bold text-[14px] text-slate-800">{loan.employee_name}</p>
                              <p className="text-[11px] font-bold text-rose-500 mt-1 uppercase tracking-wider">Tenggat: {new Date(loan.due_date).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 sm:flex-none text-[10px] bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">🔔 Ingatkan</button>
                              <Link href={`?tab=sirkulasi`} className="flex-1 sm:flex-none text-center text-[10px] bg-rose-50 text-rose-600 px-3 py-2 rounded-lg font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors">Tindak</Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-slate-50 bg-slate-50/30">
                       <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-3">
                         <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-[14px] flex items-center justify-center text-xl shadow-inner">⚠️</span> 
                         Peringatan Stok Habis
                       </h3>
                    </div>
                    <div className="p-5 sm:p-8 space-y-4 bg-slate-50/30 sm:bg-white">
                      {outOfStockBooks.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed text-slate-400 text-sm font-bold">Inventaris terkendali.</div>
                      ) : (
                        outOfStockBooks.map((book) => (
                          <div key={book.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 sm:p-5 bg-white border-l-4 border-l-amber-400 border border-slate-100 shadow-sm rounded-xl gap-2">
                            <div>
                              <p className="font-bold text-[14px] text-slate-800 line-clamp-1">{book.title}</p>
                              <p className="text-[10px] font-extrabold text-blue-500 mt-1 uppercase tracking-widest flex items-center gap-1"><span>👥</span> 2 Antrean Reservasi</p>
                            </div>
                            <span className="w-9 h-9 bg-amber-50 text-amber-600 border border-amber-200 rounded-full flex items-center justify-center font-black text-sm mt-2 sm:mt-0">0</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-6">
                      <span className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-[14px] flex items-center justify-center text-xl shadow-inner">🏆</span>
                      Pegawai Teraktif
                    </h3>
                    <ul className="space-y-4">
                      {topReaders.length === 0 ? (
                        <p className="text-sm text-slate-400 bg-slate-50 p-6 rounded-xl text-center border border-dashed border-slate-200">Belum ada data peminjaman.</p>
                      ) : (
                        topReaders.map(([email, count], index) => (
                          <li key={email} className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-900 border border-yellow-300' : index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 border border-slate-300' : 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-900 border border-orange-300'}`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 truncate">
                              <p className="text-sm font-bold text-slate-800 truncate">{email}</p>
                            </div>
                            <div className="text-center px-4 border-l border-slate-200">
                              <p className="text-xl font-black text-[#1B4332] leading-none">{count}</p>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Buku</p>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-6">
                      <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-[14px] flex items-center justify-center text-xl shadow-inner">📊</span>
                      Distribusi Kategori
                    </h3>
                    <div className="space-y-6">
                      {topCategories.length === 0 ? (
                        <p className="text-sm text-slate-400 bg-slate-50 p-6 rounded-xl text-center border border-dashed border-slate-200">Katalog kosong.</p>
                      ) : (
                        topCategories.map(([category, count]) => {
                          const percentage = Math.round((count / totalBooks) * 100);
                          return (
                            <div key={category} className="group">
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{category}</span>
                                <span className="text-xs font-black text-[#1B4332] bg-emerald-50 px-2 py-0.5 rounded-md">{count} Judul <span className="text-emerald-600/60">({percentage}%)</span></span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-[#1B4332] to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out group-hover:opacity-80" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2 & 3 (Sama seperti sebelumnya)                         */}
            {/* ========================================================= */}
            {activeTab === 'pegawai' && (
              <section className="bg-transparent md:bg-white md:rounded-[2rem] md:shadow-sm md:border border-gray-100 animate-in fade-in duration-500">
                <div className="p-2 pb-4 md:p-8 md:border-b border-gray-100 bg-white rounded-t-[2rem]">
                  <h2 className="text-xl font-black text-[#1B4332] flex items-center gap-2"><span className="text-2xl hidden md:inline-block">👥</span> Manajemen Akses Pegawai</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">ACC pendaftar baru, atur Role, atau hapus akun.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:hidden mt-2">
                  {profiles?.map((profile) => (
                    <div key={profile.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                      <div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Email Pegawai</p>
                        <p className="font-bold text-gray-900 break-all">{profile.email}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                         <div>
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Tgl Daftar</p>
                            <p className="text-gray-600 text-xs font-medium">{new Date(profile.created_at).toLocaleDateString('id-ID')}</p>
                         </div>
                         <UserAction user={profile} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-widest text-[10px]">Email Pegawai</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-widest text-[10px]">Waktu Daftar</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-widest text-[10px] text-right">Aksi & Kewenangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {profiles?.map((profile) => (
                        <tr key={profile.id} className={`hover:bg-gray-50 transition-colors ${profile.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-6 py-5 font-bold text-gray-900">{profile.email}</td>
                          <td className="px-6 py-5 text-gray-500 text-xs font-medium">{new Date(profile.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                          <td className="px-6 py-5 text-right"><UserAction user={profile} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'sirkulasi' && (
              <section className="bg-transparent md:bg-white md:rounded-[2rem] md:shadow-sm md:border border-gray-100 animate-in fade-in duration-500">
                <div className="p-2 pb-4 md:p-8 md:border-b border-gray-100 bg-white rounded-t-[2rem]">
                  <h2 className="text-xl font-black text-[#1B4332] flex items-center gap-2"><span className="text-2xl hidden md:inline-block">🔄</span> Log Sirkulasi Peminjaman</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Pantau aktivitas peminjaman, pengembalian, dan booking antrean.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:hidden mt-2">
                  {loans?.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl text-gray-400 text-sm font-medium">Belum ada aktivitas.</div>
                  ) : (
                    loans?.map((loan) => (
                      <div key={loan.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 relative">
                        <span className={`absolute top-4 right-4 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${loan.status === 'Dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{loan.status}</span>
                        <div>
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Peminjam</p>
                          <p className="font-bold text-gray-900">{loan.employee_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Buku</p>
                          <p className="text-gray-700 text-sm font-medium line-clamp-2">{loan.books?.title}</p>
                        </div>
                        <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-1">
                          <div>
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Tenggat</p>
                            <p className="text-gray-600 text-xs font-bold">{new Date(loan.due_date).toLocaleDateString('id-ID')}</p>
                          </div>
                          <ReturnButton loan={loan} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="hidden md:block overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Peminjam</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Aset Referensi</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Tenggat</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px] text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loans?.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm font-medium">Belum ada aktivitas.</td></tr>
                      ) : (
                        loans?.map((loan) => (
                          <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5 font-bold text-gray-900">{loan.employee_name}</td>
                            <td className="px-6 py-5 text-gray-700 font-medium max-w-[250px] truncate">{loan.books?.title}</td>
                            <td className="px-6 py-5 text-gray-500 text-xs font-bold">{new Date(loan.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric'})}</td>
                            <td className="px-6 py-5">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border tracking-wider ${loan.status === 'Dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{loan.status}</span>
                            </td>
                            <td className="px-6 py-5 text-right"><ReturnButton loan={loan} /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ========================================================= */}
            {/* TAB 4: KATALOG BUKU - DENGAN FITUR CETAK QR */}
            {/* ========================================================= */}
            {activeTab === 'buku' && (
              <section className="bg-transparent md:bg-white md:rounded-[2rem] md:shadow-sm md:border border-gray-100 animate-in fade-in duration-500">
                <div className="p-2 pb-4 md:p-8 md:border-b border-gray-100 bg-white rounded-t-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1B4332] flex items-center gap-2"><span className="text-2xl hidden md:inline-block">📚</span> Database Katalog Buku</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Kelola stok, lokasi rak, rating, dan cetak QR Code.</p>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <div className="flex-1 md:flex-none"><AddBookModal /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:hidden mt-2">
                  {books?.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl text-gray-400 text-sm font-medium">Katalog kosong.</div>
                  ) : (
                    books?.map((book) => (
                      <div key={book.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Judul Koleksi</p>
                            <p className="font-bold text-gray-900 leading-snug">{book.title}</p>
                          </div>
                          <BacaPDFModal url={book.pdf_url} />
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-extrabold text-[9px] border border-gray-200 uppercase tracking-wider">{book.category}</span>
                          <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-extrabold text-[9px] border border-purple-200 uppercase tracking-wider flex items-center gap-1">📍 Rak {book.rak || 'TBA'}</span>
                        </div>

                        <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-1">
                          <div>
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                            <p className="text-yellow-500 text-xs">⭐⭐⭐⭐ <span className="text-gray-500 font-bold ml-1">{book.rating || '0.0'}</span></p>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className={`font-black text-sm ${book.stock > 0 ? 'text-[#1B4332]' : 'text-rose-600'}`}>{book.stock} Pcs</span>
                             <div className="flex justify-end gap-2 border-l border-gray-100 pl-3">
                               {/* TOMBOL CETAK QR MOBILE */}
                               <QRCodeModal book={book} />
                               <EditBookModal book={book} />
                               <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                             </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="hidden md:block overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Informasi Buku</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Lokasi Rak & Rating</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Sisa Stok</th>
                        <th className="px-6 py-5 font-extrabold text-slate-400 uppercase tracking-wider text-[10px] text-right">E-Book & Kelola</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {books?.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-16 text-gray-400 text-sm font-medium">Buku belum ditambahkan.</td></tr>
                      ) : (
                        books?.map((book) => (
                          <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5">
                               <p className="font-bold text-gray-900 max-w-[250px] truncate">{book.title}</p>
                               <span className="inline-block mt-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[9px] font-extrabold border border-gray-200 uppercase tracking-wider">{book.category}</span>
                            </td>
                            <td className="px-6 py-5">
                               <p className="text-[11px] font-bold text-purple-700 bg-purple-50 inline-block px-2 py-0.5 rounded border border-purple-100 mb-1">📍 Rak {book.rak || 'TBA'}</p>
                               <p className="text-yellow-500 text-[10px]">⭐⭐⭐⭐ <span className="text-gray-500 font-bold ml-1">{book.rating || '0.0'}</span></p>
                            </td>
                            <td className="px-6 py-5"><span className={`font-black text-[15px] ${book.stock > 0 ? 'text-[#1B4332]' : 'text-rose-600'}`}>{book.stock} <span className="text-xs font-bold text-gray-400">Pcs</span></span></td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <BacaPDFModal url={book.pdf_url} />
                                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                                
                                {/* TOMBOL CETAK QR DESKTOP */}
                                <QRCodeModal book={book} />
                                
                                <EditBookModal book={book} />
                                <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          </div>
        </main>
      </div>

      {/* MENU BAWAH MOBILE */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/80 z-50 flex justify-around items-center px-2 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <Link href="?tab=overview" className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${activeTab === 'overview' ? 'text-[#1B4332]' : 'text-slate-400'}`}>
          <span className="text-[20px]">📊</span><span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Dasbor</span>
        </Link>
        <Link href="?tab=pegawai" className={`flex flex-col items-center gap-1 p-1.5 transition-colors relative ${activeTab === 'pegawai' ? 'text-[#1B4332]' : 'text-slate-400'}`}>
          <span className="text-[20px]">👥</span><span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Pegawai</span>
          {pendingUsers > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm"></span>}
        </Link>
        
        {/* SCANNER VERSI MOBILE KITA TARUH DI TENGAH BAWAH */}
        <div className="relative -top-5">
          <ScanBukuModal isLoggedIn={true} />
        </div>

        <Link href="?tab=sirkulasi" className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${activeTab === 'sirkulasi' ? 'text-[#1B4332]' : 'text-slate-400'}`}>
          <span className="text-[20px]">🔄</span><span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Sirkulasi</span>
        </Link>
        <Link href="?tab=buku" className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${activeTab === 'buku' ? 'text-[#1B4332]' : 'text-slate-400'}`}>
          <span className="text-[20px]">📚</span><span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Buku</span>
        </Link>
      </nav>

      <AIAssistant />
    </div>
  );
}