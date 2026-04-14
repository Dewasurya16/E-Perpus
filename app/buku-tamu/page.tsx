import { supabase } from '../../lib/supabase';
import BukuTamuForm from './components/BukuTamuForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── Ambil statistik saja (bukan list) ────────────────────────
export default async function BukuTamuPage() {
  const { count: totalCount } = await supabase
    .from('buku_tamu')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const total = totalCount ?? 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className="relative bg-[#0f2a1c] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/"
              className="text-emerald-400/70 hover:text-emerald-300 text-[11px] font-bold uppercase tracking-widest transition-colors"
            >
              ← Beranda
            </Link>
            <span className="text-white/20 text-[11px]">/</span>
            <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Buku Tamu</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Terbuka untuk Umum
              </div>

              <h1
                className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Buku Tamu
              </h1>
              <p className="text-emerald-100/60 text-sm font-medium leading-relaxed">
                Sampaikan tujuan kunjungan, kritik, dan saran Anda ke{' '}
                <span className="text-emerald-300 font-bold">Kejaksaan Negeri Soppeng</span>.
                Setiap masukan berharga bagi perbaikan layanan kami.
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-center flex-shrink-0">
              <p className="text-4xl font-black text-white">{total}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Kunjungan</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN: Form Pengisian ─────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Kiri: Info + CTA */}
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">
              Silakan Mengisi Buku Tamu
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
              Pengisian buku tamu merupakan bagian dari standar pelayanan publik kami. 
              Data yang Anda berikan akan dicatat secara digital dan hanya dapat diakses oleh petugas.
            </p>

            {/* Steps preview */}
            <div className="space-y-4 mb-8">
              {[
                { no: '01', label: 'Isi Identitas', desc: 'Nama lengkap dan bidang/instansi asal' },
                { no: '02', label: 'Keperluan & Saran', desc: 'Tujuan kunjungan dan masukan Anda' },
                { no: '03', label: 'Tanda Tangan', desc: 'Konfirmasi dengan tanda tangan digital' },
              ].map((s) => (
                <div key={s.no} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] font-black text-[11px] flex-shrink-0">
                    {s.no}
                  </div>
                  <div>
                    <p className="font-black text-slate-700 text-sm">{s.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <BukuTamuForm />
          </div>

          {/* Kanan: Info panel */}
          <div className="space-y-4">

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">📋 Informasi Penting</p>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Data kunjungan Anda bersifat <strong>rahasia</strong> dan hanya digunakan untuk keperluan administrasi 
                internal Kejaksaan Negeri Soppeng. Kunjungan yang belum diverifikasi tidak akan ditampilkan secara publik.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">📞 Informasi Kontak</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Alamat', val: 'Jl. Samudra No.18, Lemba, Watansoppeng, Kabupaten Soppeng, Sulawesi Selatan 90811' },
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

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Note admin */}
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