'use client';

import { useState, useRef, useEffect } from 'react';

const QUICK_PROMPTS = [
  { icon: '🔍', label: 'Cari Buku Pidana',   text: 'Tolong carikan rekomendasi buku terkait Hukum Pidana yang ada di perpustakaan.' },
  { icon: '📚', label: 'Pinjam Buku',         text: 'Saya ingin meminjam buku. Tolong bantu saya.' },
  { icon: '👥', label: 'Info Pegawai',         text: 'Saya ingin mencari data pegawai di kantor ini.' },
  { icon: '📅', label: 'Cek Aturan Pinjam',   text: 'Berapa lama batas waktu peminjaman buku untuk pegawai, dan apa sanksinya jika terlambat?' },
  { icon: '💡', label: 'Panduan QR Code',     text: 'Bagaimana langkah-langkah meminjam buku menggunakan fitur Scan QR Code?' },
];

export default function AIAssistant() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<{ role: string; text: string }[]>([]);
  const [input,     setInput]     = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'ai',
          text: 'Halo! Saya **Lexi**, Asisten Pintar E-Perpus Kejaksaan Negeri Soppeng. 🤖\n\nSaya bisa membantu Anda mencari buku, **meminjam langsung lewat chat ini**, hingga cek info pegawai. Silakan ketik atau pilih menu cepat di bawah:',
        },
      ]);
    }
  }, [messages.length]);

  // Auto-scroll
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, isOpen]);

  const generateSmartResponse = async (userText: string) => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          // Kirim maks 10 pesan terakhir (hemat token, hindari payload besar)
          history: messages.slice(1).slice(-10),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'Aduh, otak AI saya sedang kepanasan nih! 🤯 Sistem Google mendeteksi terlalu banyak pesan dalam 1 menit terakhir. Mohon beri saya waktu istirahat sekitar 1 menit, lalu tanyakan lagi ya, Bos!',
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Maaf, koneksi internet sepertinya terputus atau server sedang down. Coba refresh halaman ya. 🔄' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Guard: tolak jika sedang mengetik (anti double-submit)
  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages((prev) => [...prev, { role: 'user', text: text.trim() }]);
    setInput('');
    generateSmartResponse(text.trim());
  };

  const clearChat = () => {
    setMessages([
      { role: 'ai', text: 'Sesi obrolan telah dibersihkan. Ada hal lain yang ingin Anda ketahui? ✨' },
    ]);
  };

  // Render **bold** markdown
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-black text-emerald-800">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Apakah pesan ini adalah konfirmasi booking sukses?
  const isBookingSuccess = (text: string) =>
    text.includes('Peminjaman Berhasil Dicatat') || text.includes('✅');

  return (
    <div className="fixed bottom-[90px] md:bottom-6 right-6 z-[99999] flex flex-col items-end">

      {/* ── JENDELA CHAT ─────────────────────────────────────────────── */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[420px] h-[580px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-200/80 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 zoom-in-95 duration-300 origin-bottom-right">

          {/* HEADER */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1B4332] p-5 flex justify-between items-center relative overflow-hidden shrink-0">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 relative">
                <span className="text-2xl">🤖</span>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-800 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-white text-[15px] tracking-tight leading-tight">Lexi — Asisten Perpustakaan</h3>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5 opacity-90">Kejaksaan Negeri Soppeng · Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button onClick={clearChat} title="Bersihkan Obrolan" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors">🧹</button>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-rose-500/80 hover:bg-rose-500 flex items-center justify-center text-white transition-colors">✕</button>
            </div>
          </div>

          {/* AREA PESAN */}
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 space-y-5 hide-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[14px] shadow-sm mr-2 shrink-0 border border-slate-300/50 mt-1">🤖</div>
                )}

                <div className="flex flex-col gap-1 max-w-[80%]">
                  {/* Bubble pesan */}
                  <div className={`p-4 text-[13.5px] shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#1B4332] to-emerald-800 text-white rounded-2xl rounded-tr-sm font-medium'
                      : isBookingSuccess(msg.text)
                        ? 'bg-emerald-50 border-2 border-emerald-200 text-slate-700 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
                  }`}>
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Badge konfirmasi booking */}
                  {isBookingSuccess(msg.text) && (
                    <div className="flex items-center gap-1.5 ml-1 mt-0.5">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest">
                        ✓ Tercatat di Database
                      </span>
                    </div>
                  )}

                  {/* Quick prompts — muncul di bawah welcome message */}
                  {idx === 0 && messages.length === 1 && (
                    <div className="mt-4 grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">Coba tanyakan:</p>
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt.text)}
                          disabled={isTyping}
                          className="flex items-center gap-3 text-left p-3 bg-white border border-emerald-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm group disabled:opacity-50"
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform">{prompt.icon}</span>
                          <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-emerald-800">{prompt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start items-end">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[14px] shadow-sm mr-2 shrink-0 border border-slate-300/50">🤖</div>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2 relative"
            >
              <input
                type="text"
                placeholder={isTyping ? 'Lexi sedang mengetik...' : 'Ketik pertanyaan di sini...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:font-medium placeholder:text-slate-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 w-10 h-10 bg-gradient-to-br from-emerald-500 to-[#1B4332] text-white rounded-[12px] flex items-center justify-center hover:scale-105 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 transition-all shadow-md disabled:shadow-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
              </button>
            </form>
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-3">
              AI dapat membuat kesalahan. Cek kembali info penting.
            </p>
          </div>
        </div>
      )}

      {/* ── FAB BUTTON ────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border-2 ${
          isOpen
            ? 'bg-rose-500 rotate-90 border-rose-400'
            : 'bg-gradient-to-tr from-emerald-500 to-[#1B4332] border-emerald-400'
        }`}
      >
        {isOpen ? (
          <span className="text-white text-2xl font-black">✕</span>
        ) : (
          <div className="relative">
            <span className="text-white text-3xl">🤖</span>
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 border-2 border-[#1B4332] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 border-2 border-[#1B4332] rounded-full" />
          </div>
        )}
      </button>
    </div>
  );
}