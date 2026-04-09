"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleRegister } from "../actions";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{type: 'error' | 'success', msg: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => setIsMounted(true), []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setStatus(null);
    const result = await handleRegister(email, password);
    
    if (result.success) {
      setStatus({ 
        type: 'success', 
        msg: "Pendaftaran Berhasil! Akun Anda sedang menunggu persetujuan (ACC) dari Admin." 
      });
      setEmail(""); 
      setPassword("");
    } else {
      setStatus({ 
        type: 'error', 
        msg: result.message || "Gagal mendaftar. Silakan coba lagi." 
      });
    }
    setIsLoading(false);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[400px] bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-200">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-[#1B4332] rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight uppercase">Daftar Akun</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">E-Perpus Kejaksaan Negeri Soppeng</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {status && (
            <div className={`p-4 text-xs sm:text-sm rounded-xl font-bold text-center border ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {status.msg}
            </div>
          )}

          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Alamat Email</label>
            <input
              type="email" required
              className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all text-sm text-gray-900"
              placeholder="nama@knsoppeng.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Buat Kata Sandi</label>
            <input
              type="password" required
              className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all text-sm text-gray-900 tracking-widest"
              placeholder="Minimal 6 karakter"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit" disabled={isLoading || !email || !password}
            className="w-full py-3.5 bg-[#1B4332] text-white rounded-xl font-bold text-sm hover:bg-[#123023] transition-all mt-4 shadow-md uppercase tracking-wide disabled:opacity-50"
          >
            {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Sudah punya akun? <Link href="/login" className="text-[#1B4332] font-bold hover:underline">Masuk ke Sistem</Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}