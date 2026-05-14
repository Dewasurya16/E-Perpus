import { supabase } from '../../lib/supabase';
import BukuTamuForm from './components/BukuTamuForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BukuTamuPage() {
  const { count: totalCount } = await supabase
    .from('buku_tamu')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { data: featuredEntries } = await supabase
    .from('buku_tamu')
    .select('id, nama, bidang, asal_instansi, keperluan, pesan, created_at')
    .eq('status', 'approved')
    .eq('tampil_publik', true)
    .order('created_at', { ascending: false })
    .limit(3);

  const total    = totalCount ?? 0;
  const featured = featuredEntries || [];

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans overflow-x-hidden">

      {/* ── HERO ── */}
      <div className="relative bg-[#0f2a1c] overflow-hidden pt-16 pb-20">
        {/* BG layers */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="anim-blob absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="anim-blob-d absolute bottom-0 left-16 w-64 h-64 bg-amber-400/10 rounded-full blur-[60px] translate-y-1/2 pointer-events-none" />

        {/* Decorative */}
        <div className="anim-float absolute right-16 top-16 opacity-[0.06] text-[7rem] select-none hidden lg:block rotate-12">📋</div>
        <div className="anim-float-d absolute right-48 bottom-12 opacity-[0.06] text-[5rem] select-none hidden lg:block -rotate-12">🏛️</div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="anim-up-1 flex items-center gap-2 mb-8">
            <Link href="/" className="text-emerald-400/70 hover:text-emerald-300 text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Beranda
            </Link>
            <span className="text-white/20 text-[11px]">/</span>
            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Buku Tamu</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-xl">
              <div className="anim-up-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-[pulseRing_2s_infinite]" />
                Terbuka untuk Umum
              </div>
              <h1 className="anim-up-3 font-display text-4xl sm:text-5xl md:text-[4rem] font-black text-white leading-tight mb-5 drop-shadow-lg">
                Buku<br/>
                <span className="shimmer-green">Tamu</span>
              </h1>
              <p className="anim-up-4 text-emerald-100/60 text-[15px] font-medium leading-relaxed max-w-md drop-shadow-md">
                Sampaikan tujuan kunjungan, kritik, dan saran Anda ke{' '}
                <span className="text-emerald-300 font-bold">Kejaksaan Negeri Soppeng</span>.
                Setiap masukan berharga bagi perbaikan layanan kami.
              </p>
            </div>

            {/* Stats cards */}
            <div className="anim-up-5 flex gap-4 flex-shrink-0">
              <div className="glass-dark rounded-2xl px-8 py-6 text-center border border-white/10 shadow-[var(--shadow-md)] hover:-translate-y-1 transition-transform duration-300">
                <p className="text-4xl font-black text-white tabular-nums leading-none">{total}</p>
                <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mt-2.5">Total Kunjungan</p>
              </div>
              <div className="glass-dark rounded-2xl px-8 py-6 text-center border border-[var(--green-main)] shadow-[var(--shadow-md)] hover:-translate-y-1 transition-transform duration-300">
                <p className="text-4xl font-black text-emerald-300 leading-none">✓</p>
                <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mt-2.5">Terverifikasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0,25 C480,50 960,0 1440,25 L1440,50 L0,50 Z" fill="var(--background)"/>
          </svg>
        </div>
      </div>

      {/* ── TESTIMONIAL ── */}
      {featured.length > 0 && (
        <section className="bg-white border-b border-slate-100 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-8 w-1.5 bg-gradient-to-b from-[var(--green-main)] to-emerald-400 rounded-full shadow-sm" />
              <div>
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Kunjungan Terbaru</p>
                <h2 className="text-2xl font-display font-black text-slate-800">Testimoni &amp; Kunjungan Terpilih</h2>
              </div>
            </div>

            <div className={`grid gap-6 ${featured.length === 1 ? 'grid-cols-1 max-w-sm' : featured.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {featured.map((entry: any, i: number) => (
                <div
                  key={entry.id}
                  className="reveal relative bg-gradient-to-br from-[#0f2e22] via-[#1B4332] to-[#255940] rounded-2xl p-8 overflow-hidden card-hover border border-emerald-700/30 shadow-[var(--shadow-md)]"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="anim-blob absolute top-0 right-0 w-32 h-32 bg-emerald-400/15 rounded-full blur-[40px]" />
                  <span className="text-emerald-300/20 text-[5rem] font-black absolute top-2 right-4 leading-none select-none font-display">&ldquo;</span>

                  <div className="relative z-10">
                    <p className="text-emerald-100/80 text-[14px] font-medium leading-relaxed mb-6 italic min-h-[60px]">
                      &ldquo;{entry.pesan || 'Telah mengunjungi perpustakaan Kejaksaan Negeri Soppeng.'}&rdquo;
                    </p>
                    <div className="flex items-center gap-4 pt-5 border-t border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/30 to-emerald-800/40 rounded-xl flex items-center justify-center text-emerald-200 font-black text-[14px] flex-shrink-0 border border-white/10 shadow-sm">
                        {entry.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-[13px] leading-tight truncate">{entry.nama}</p>
                        <p className="text-emerald-400/70 text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate">
                          {entry.bidang || entry.asal_instansi || entry.keperluan}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-400/50 text-[9px] font-black">
                          {new Date(entry.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-400/20 text-emerald-300 rounded text-[9px] font-black uppercase tracking-[0.1em]">
                          ✓ Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FORM SECTION ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Info + Form */}
          <div>
            <div className="reveal mb-10">
              <h2 className="text-3xl font-display font-black text-slate-900 mb-3">Silakan Mengisi Buku Tamu</h2>
              <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                Pengisian buku tamu merupakan bagian dari standar pelayanan publik kami. Data yang Anda berikan dilindungi dan hanya dapat diakses oleh petugas.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-10">
              {[
                { no: '01', icon: '👤', label: 'Isi Identitas',    desc: 'Nama lengkap dan bidang/instansi asal' },
                { no: '02', icon: '💬', label: 'Keperluan & Saran', desc: 'Tujuan kunjungan dan masukan Anda' },
                { no: '03', icon: '✍️', label: 'Tanda Tangan',      desc: 'Konfirmasi dengan tanda tangan digital' },
              ].map((s, i) => (
                <div
                  key={s.no}
                  className="reveal flex items-start gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-[var(--shadow-sm)] card-hover-sm"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--green-main)] text-white flex items-center justify-center font-black text-[13px] flex-shrink-0 shadow-[var(--shadow-sm)]">
                    {s.no}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-[14px] flex items-center gap-2 mb-1">
                      <span>{s.icon}</span> {s.label}
                    </p>
                    <p className="text-[12px] text-slate-500 font-medium">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <BukuTamuForm />
          </div>

          {/* Right: Info cards */}
          <div className="space-y-5">
            {/* Important notice */}
            <div className="reveal bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/70 rounded-2xl p-6 shadow-sm">
              <p className="text-[11px] font-black text-amber-700 uppercase tracking-[0.2em] mb-3">📋 Informasi Penting</p>
              <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                Data kunjungan Anda bersifat <strong>rahasia</strong> dan hanya digunakan untuk keperluan administrasi internal.
                Kunjungan yang belum diverifikasi tidak akan ditampilkan secara publik.
              </p>
            </div>

            {/* Contact info */}
            <div className="reveal bg-white border border-slate-100 rounded-2xl p-6 shadow-[var(--shadow-md)] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--green-main)] via-emerald-400 to-amber-400 rounded-t-2xl" />
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 mt-2">📞 Informasi Kontak</p>
              <div className="space-y-3">
                {[
                  { icon: '📍', label: 'Alamat',       val: 'Jl. Samudra No.18, Lemba, Watansoppeng, Kab. Soppeng, Sulawesi Selatan 90811' },
                  { icon: '📞', label: 'Telepon',      val: '0853-9951-2452' },
                  { icon: '🕐', label: 'Jam Layanan',  val: 'Senin–Jumat, 08.00–16.00 WITA' },
                  { icon: '🌐', label: 'Website',      val: 'kejari-soppeng.kejaksaan.go.id' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-100 transition-all duration-300">
                    <span className="text-[18px] flex-shrink-0 mt-1">{item.icon}</span>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-[13px] font-semibold text-slate-800 mt-1 leading-relaxed">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="reveal text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center mt-6">
              🔒 Data kunjungan hanya dapat dilihat oleh administrator
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}