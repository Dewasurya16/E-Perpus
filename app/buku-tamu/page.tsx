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

  // Ambil entri yang ditandai "tampil_publik" oleh admin (maks 3)
  const { data: featuredEntries } = await supabase
    .from('buku_tamu')
    .select('id, nama, bidang, asal_instansi, keperluan, pesan, created_at')
    .eq('status', 'approved')
    .eq('tampil_publik', true)
    .order('created_at', { ascending: false })
    .limit(3);

  const total = totalCount ?? 0;
  const featured = featuredEntries || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* ── HERO BANNER ── */}
      <div className="relative bg-[#0f2a1c] overflow-hidden">
        <div className="absolute inset-0 opacity-[.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <Link href="/" className="text-emerald-400/70 hover:text-emerald-300 text-[11px] font-bold uppercase tracking-widest transition-colors">← Beranda</Link>
            <span className="text-white/20 text-[11px]">/</span>
            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Buku Tamu</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Terbuka untuk Umum
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-3 sm:mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Buku Tamu
              </h1>
              <p className="text-emerald-100/60 text-sm font-medium leading-relaxed">
                Sampaikan tujuan kunjungan, kritik, dan saran Anda ke{' '}
                <span className="text-emerald-300 font-bold">Kejaksaan Negeri Soppeng</span>.
                Setiap masukan berharga bagi perbaikan layanan kami.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 sm:px-8 py-4 sm:py-5 text-center flex-shrink-0">
              <p className="text-3xl sm:text-4xl font-black text-white">{total}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Kunjungan Terverifikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIAL PUBLIK (entri yang dipilih admin) ── */}
      {featured.length > 0 && (
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-[#1B4332] rounded-full" />
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Kunjungan Terbaru</p>
                <h2 className="text-lg sm:text-xl font-black text-slate-800">Testimoni & Kunjungan Terpilih</h2>
              </div>
            </div>

            <div className={`grid gap-4 ${featured.length === 1 ? 'grid-cols-1 max-w-sm' : featured.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {featured.map((entry: any) => (
                <div key={entry.id} className="relative bg-gradient-to-br from-[#0f2a1c] to-[#1B4332] rounded-2xl p-5 sm:p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl" />
                  <span className="text-emerald-300/50 text-5xl font-black absolute top-2 right-4 leading-none">&ldquo;</span>

                  <div className="relative z-10">
                    {entry.pesan && (
                      <p className="text-emerald-100/80 text-sm font-medium leading-relaxed mb-4 italic">
                        &ldquo;{entry.pesan}&rdquo;
                      </p>
                    )}

                    {!entry.pesan && (
                      <p className="text-emerald-100/60 text-sm font-medium leading-relaxed mb-4 italic">
                        Telah mengunjungi perpustakaan Kejaksaan Negeri Soppeng.
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                      <div className="w-9 h-9 bg-emerald-400/20 rounded-xl flex items-center justify-center text-emerald-300 font-black text-sm flex-shrink-0">
                        {entry.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-black text-sm leading-tight">{entry.nama}</p>
                        <p className="text-emerald-400/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                          {entry.bidang || entry.asal_instansi || entry.keperluan}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <p className="text-emerald-400/50 text-[9px] font-bold text-right">
                          {new Date(entry.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-400/20 text-emerald-300 rounded text-[8px] font-black uppercase tracking-widest">
                          ✓ Terverifikasi
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

      {/* ── MAIN: Form ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-3">Silakan Mengisi Buku Tamu</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
              Pengisian buku tamu merupakan bagian dari standar pelayanan publik kami.
              Data yang Anda berikan akan dicatat secara digital dan hanya dapat diakses oleh petugas.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { no: '01', label: 'Isi Identitas', desc: 'Nama lengkap dan bidang/instansi asal' },
                { no: '02', label: 'Keperluan & Saran', desc: 'Tujuan kunjungan dan masukan Anda' },
                { no: '03', label: 'Tanda Tangan', desc: 'Konfirmasi dengan tanda tangan digital' },
              ].map((s) => (
                <div key={s.no} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] font-black text-[11px] flex-shrink-0">{s.no}</div>
                  <div>
                    <p className="font-black text-slate-700 text-sm">{s.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <BukuTamuForm />
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">📋 Informasi Penting</p>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Data kunjungan Anda bersifat <strong>rahasia</strong> dan hanya digunakan untuk keperluan administrasi internal. Kunjungan yang belum diverifikasi tidak akan ditampilkan secara publik.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">📞 Informasi Kontak</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Alamat', val: 'Jl. Samudra No.18, Lemba, Watansoppeng, Kab. Soppeng, Sulawesi Selatan 90811' },
                  { label: 'Telepon', val: '0853-9951-2452' },
                  { label: 'Jam Layanan', val: 'Senin–Jumat, 08.00–16.00 WITA' },
                ].map((i) => (
                  <div key={i.label} className="flex items-start gap-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-20 flex-shrink-0 mt-0.5">{i.label}</p>
                    <p className="text-xs font-semibold text-slate-700">{i.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
              🔒 Data kunjungan hanya dapat dilihat oleh administrator
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>
    </div>
  );
}