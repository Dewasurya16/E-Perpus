"use client";

import { useState, useEffect } from "react";
import { handleRegister } from "../actions";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [strength, setStrength]   = useState(0);

  useEffect(() => setIsMounted(true), []);

  const calcStrength = (p: string) => {
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    setStrength(s);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    const result = await handleRegister(email, password);
    if (result.success) {
      setStatus({ type: 'success', msg: 'Pendaftaran berhasil! Akun Anda menunggu persetujuan Admin.' });
      setEmail('');
      setPassword('');
      setStrength(0);
    } else {
      setStatus({ type: 'error', msg: result.message || 'Gagal mendaftar. Silakan coba lagi.' });
    }
    setIsLoading(false);
  };

  if (!isMounted) return null;

  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981', '#1B4332'];

  return (
    <div className="min-h-screen flex font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes floatBlob {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-16px) scale(1.05); }
        }
        @keyframes shimmerBtn {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .anim-up    { animation: fadeUp .6s ease both; }
        .anim-up-d1 { animation: fadeUp .6s .1s ease both; }
        .anim-up-d2 { animation: fadeUp .6s .2s ease both; }
        .anim-up-d3 { animation: fadeUp .6s .3s ease both; }
        .anim-up-d4 { animation: fadeUp .6s .4s ease both; }
        .anim-up-d5 { animation: fadeUp .6s .5s ease both; }
        .blob-1 { animation: floatBlob 8s ease-in-out infinite; }
        .blob-2 { animation: floatBlob 8s 2s ease-in-out infinite; }

        .spin-ring {
          border: 3px solid rgba(255,255,255,.25);
          border-top-color: #fff;
          border-radius: 50%;
          width: 18px; height: 18px;
          animation: spinRing .7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        .input-field {
          width: 100%;
          padding: 14px 18px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          color: #0F172A;
          outline: none;
          transition: all .2s;
        }
        .input-field:focus {
          background: #fff;
          border-color: #1B4332;
          box-shadow: 0 0 0 3px rgba(27,67,50,.1);
        }
        .input-field::placeholder { color: #94A3B8; }
      `}</style>

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0f2a1c] relative overflow-hidden flex-col justify-between p-12">
        <div className="blob-1 absolute top-16 right-8 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="blob-2 absolute bottom-24 left-4 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-[#1B4332] rounded-xl flex items-center justify-center shadow-lg border border-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <div>
            <p className="text-white font-bold text-[13px] leading-none">E-Perpustakaan</p>
            <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Kejaksaan RI</p>
          </div>
        </div>

        {/* Center */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> Pendaftaran Baru
          </div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Bergabung<br/>Bersama<br/>Kami.
          </h2>
          <p className="text-emerald-100/60 text-[14px] leading-relaxed max-w-xs font-medium">
            Daftarkan akun Anda sebagai pegawai Kejaksaan Negeri Soppeng untuk mengakses fitur peminjaman digital.
          </p>

          {/* Steps */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { step: '01', text: 'Isi email & password'        },
              { step: '02', text: 'Tunggu persetujuan Admin'    },
              { step: '03', text: 'Akses sistem perpustakaan'   },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-900/60 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">{s.step}</span>
                <span className="text-[12px] font-semibold text-emerald-100/80">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-emerald-900/60 font-medium uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Pranata Komputer 625
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 anim-up">
            <div className="w-9 h-9 bg-[#1B4332] rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <div>
              <p className="text-slate-900 font-bold text-[13px]">E-Perpustakaan</p>
              <p className="text-emerald-600 text-[10px] font-semibold uppercase tracking-widest">Kejaksaan RI</p>
            </div>
          </div>

          <div className="anim-up-d1 mb-8">
            <h1 className="font-display text-[2rem] text-slate-900 leading-tight">Buat Akun Baru</h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1.5">Daftar sebagai pegawai terdaftar.</p>
          </div>

          {/* Success state */}
          {status?.type === 'success' ? (
            <div className="anim-up text-center py-8 px-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-white shadow-lg shadow-emerald-500/30">✓</div>
              <h3 className="font-display text-xl text-emerald-800 mb-2">Berhasil Mendaftar!</h3>
              <p className="text-[13px] text-emerald-700 font-medium leading-relaxed mb-6">{status.msg}</p>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4332] text-white rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#143628] transition-all">
                Lanjut ke Halaman Login
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">

              {status?.type === 'error' && (
                <div className="anim-up flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <span className="text-red-500 text-lg mt-0.5 shrink-0">⚠️</span>
                  <p className="text-red-700 text-[12px] font-semibold leading-relaxed">{status.msg}</p>
                </div>
              )}

              {/* Email */}
              <div className="anim-up-d2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Alamat Email</label>
                <input
                  type="email" required
                  className="input-field"
                  placeholder="nama@knsoppeng.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="anim-up-d3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Buat Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    className="input-field pr-12"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); calcStrength(e.target.value); }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColor[strength] : '#E2E8F0' }} />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: strengthColor[strength] }}>
                      {strength > 0 ? `Keamanan: ${strengthLabel[strength]}` : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Info box */}
              <div className="anim-up-d4 flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-100 rounded-xl">
                <span className="text-amber-500 shrink-0 text-base">ℹ️</span>
                <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                  Akun baru akan memasuki status <strong>Pending</strong> dan perlu disetujui oleh Admin sebelum bisa digunakan.
                </p>
              </div>

              {/* Submit */}
              <div className="anim-up-d5 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-[52px] rounded-2xl font-bold text-[13px] uppercase tracking-wider text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20"
                  style={isLoading
                    ? { background: 'linear-gradient(90deg,#1B4332 0%,#2d6a4f 40%,#1B4332 80%)', backgroundSize: '200% auto', animation: 'shimmerBtn 1.5s linear infinite' }
                    : { background: '#1B4332' }
                  }
                >
                  {isLoading ? (
                    <>
                      <span className="spin-ring" />
                      Mendaftarkan Akun...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                      Daftar Sekarang
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="anim-up-d5 mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-[13px] text-slate-500 font-medium">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-[#1B4332] font-bold hover:underline underline-offset-2">
                Masuk ke Sistem
              </Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link href="/" className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Kembali ke E-Katalog Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}