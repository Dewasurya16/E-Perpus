  "use client";

  import { useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import { handleLogin } from "../actions";
  import Link from "next/link";

  export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => setIsMounted(true), []);

  const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;

      setIsLoading(true);
      setErrorMsg("");

      try {
        const result = await handleLogin(email, password);

        if (result.success && result.url) {
          // PAKSA REFRESH TOTAL KE HALAMAN TUJUAN
          // Ini mencegah "stuck" karena session cookie langsung terbaca segar
          window.location.href = result.url;
        } else {
          setErrorMsg(result.message || "Email atau password salah.");
          setIsLoading(false);
        }
      } catch (err) {
        setErrorMsg("Koneksi gagal. Silakan coba lagi.");
        setIsLoading(false);
      }
    };

    if (!isMounted) return null; 

    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-[400px] bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 bg-[#1B4332] rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight uppercase">E-Perpus</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Kejaksaan Negeri Soppeng</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs sm:text-sm rounded-xl font-bold text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email Pegawai</label>
              <input
                type="email" required
                className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all text-sm text-gray-900"
                placeholder="nama@knsoppeng.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Kata Sandi</label>
              <input
                type="password" required
                className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all text-sm text-gray-900 tracking-widest"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit" disabled={isLoading || !email || !password}
              className="w-full py-3.5 bg-[#1B4332] text-white rounded-xl font-bold text-sm hover:bg-[#123023] transition-all mt-4 shadow-md uppercase tracking-wide"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Belum punya akun? <Link href="/register" className="text-[#1B4332] font-bold hover:underline">Daftar di sini</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }