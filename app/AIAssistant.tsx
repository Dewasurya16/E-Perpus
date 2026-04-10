'use client';

import { useState, useRef, useEffect } from 'react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Saya Asisten Pintar E-Perpus Kejaksaan. Ada yang bisa saya bantu terkait pencarian aset buku, lokasi rak, atau aturan peminjaman?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Logika "Otak" AI Terhubung ke Backend Gemini Asli
  const generateSmartResponse = async (userText: string) => {
    try {
      // Memanggil API Route yang terhubung ke Google Gemini dan Supabase
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Maaf, koneksi ke server otak AI terputus. Coba lagi dalam beberapa saat." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Panggil kecerdasan AI yang asli
    generateSmartResponse(userMessage);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end">
      
      {/* Jendela Chat */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 zoom-in-95 duration-300 origin-bottom-right">
          
          {/* Header Premium AI */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/10 animate-pulse">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-black text-white tracking-tight">Asisten E-Perpus</h3>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 flex items-center justify-center text-white/70 hover:text-white transition-colors relative z-10">✕</button>
          </div>

          {/* Area Pesan Chat */}
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#1B4332] text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm font-medium leading-relaxed whitespace-pre-wrap'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Indikator Mengetik */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Canggih */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex items-center gap-2 relative">
              <input 
                type="text" 
                placeholder="Tanya seputar perpustakaan..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-12 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="absolute right-2 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 disabled:bg-slate-300 transition-colors shadow-md"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tombol Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(16,185,129,0.4)] transition-all transform hover:scale-110 hover:-translate-y-1 ${isOpen ? 'bg-rose-500 rotate-90' : 'bg-gradient-to-tr from-emerald-500 to-[#1B4332]'}`}
      >
        {isOpen ? (
          <span className="text-white text-2xl font-black">✕</span>
        ) : (
          <span className="text-white text-3xl">🤖</span>
        )}
      </button>

    </div>
  );
}