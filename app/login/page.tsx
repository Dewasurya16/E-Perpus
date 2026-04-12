"use client";

import { useState, useEffect } from "react";
import { handleLogin } from "../actions";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPass, setShowPass]   = useState(false);

  useEffect(() => setIsMounted(true), []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const result = await handleLogin(email, password);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setErrorMsg(result.message || "Email atau password salah.");
        setIsLoading(false);
      }
    } catch {
      setErrorMsg("Koneksi gagal. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

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
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.5); opacity: 0;  }
        }

        .anim-up { animation: fadeUp .6s ease both; }
        .anim-up-d1 { animation: fadeUp .6s .1s ease both; }
        .anim-up-d2 { animation: fadeUp .6s .2s ease both; }
        .anim-up-d3 { animation: fadeUp .6s .3s ease both; }
        .anim-up-d4 { animation: fadeUp .6s .4s ease both; }
        .blob-1 { animation: floatBlob 8s ease-in-out infinite; }
        .blob-2 { animation: floatBlob 8s 2s ease-in-out infinite; }

        .btn-shimmer {
          background: linear-gradient(90deg,#1B4332 0%,#2d6a4f 40%,#1B4332 80%);
          background-size: 200% auto;
          animation: shimmerBtn 1.5s linear infinite;
        }
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

      {/* ── LEFT PANEL (Decorative) ────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0f2a1c] relative overflow-hidden flex-col justify-between p-12">
        {/* Blobs */}
        <div className="blob-1 absolute top-16 right-8 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="blob-2 absolute bottom-16 left-4 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-[#1B4332] rounded-xl flex items-center justify-center shadow-lg border border-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <div>
            <p className="text-white font-bold text-[13px] leading-none">E-Perpustakaan</p>
            <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Kejaksaan Negeri Soppeng</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Portal Pegawai
          </div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Selamat<br/>Datang<br/>Kembali.
          </h2>
          <p className="text-emerald-100/60 text-[14px] leading-relaxed max-w-xs font-medium">
            Masuk untuk mengakses sistem manajemen perpustakaan dan aset Kejaksaan Negeri Soppeng.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: '📚', text: 'Kelola koleksi buku & aset'        },
              { icon: '🔄', text: 'Sistem peminjaman digital'           },
              { icon: '📊', text: 'Laporan & ekspor otomatis'           },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-[12px] font-semibold text-emerald-100/80">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
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
              <p className="text-emerald-600 text-[10px] font-semibold uppercase tracking-widest">Kejaksaan Negeri Soppeng</p>
            </div>
          </div>

          <div className="anim-up-d1 mb-8">
            <h1 className="font-display text-[2rem] text-slate-900 leading-tight">Masuk ke Sistem</h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1.5">Gunakan email & password akun Anda.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Error message */}
            {errorMsg && (
              <div className="anim-up flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <span className="text-red-500 text-lg mt-0.5 shrink-0">⚠️</span>
                <p className="text-red-700 text-[12px] font-semibold leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Email */}
            <div className="anim-up-d2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Pegawai</label>
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="anim-up-d4 pt-2">
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
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Masuk ke Sistem
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="anim-up-d4 mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-[13px] text-slate-500 font-medium">
              Belum punya akun?{' '}
              <Link href="/register" className="text-[#1B4332] font-bold hover:underline underline-offset-2">
                Daftar di sini
              </Link>
            </p>
          </div>

          <div className="anim-up-d4 mt-6 text-center">
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