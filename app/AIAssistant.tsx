"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase"; 

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Halo Bos! 👋 Saya Asisten AI E-Perpus. Mau cari buku referensi atau sekadar ngobrol santai hari ini?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Fungsi merapikan teks tebal (**) dan baris baru (\n)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
          part.startsWith('**') && part.endsWith('**') 
            ? <strong key={j} className="text-gray-900 font-black">{part.slice(2, -2)}</strong> 
            : part
        )}
        <br />
      </span>
    ));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    const query = userText.toLowerCase();
    let aiResponse = "";

    try {
      // ==========================================
      // 1. LOGIKA NGOBROL SANTAI & CHIT-CHAT
      // ==========================================
      if (query.match(/^(halo|hai|pagi|siang|sore|malam|assalamualaikum|hey|oy)/)) {
        aiResponse = "Halo juga, Bos! Saya selalu *standby* 24/7 di sini. Ada yang bisa saya bantu hari ini? 🫡";
      } 
      else if (query.includes("kabar")) {
        aiResponse = "Kabar saya selalu 100% prima karena servernya sehat, Bos! Kalau Bos sendiri gimana kabarnya hari ini? Semoga kerjaannya lancar terus ya.";
      }
      else if (query.includes("siapa") && (query.includes("kamu") || query.includes("namamu") || query.includes("nama kamu"))) {
        aiResponse = "Perkenalkan, saya adalah **AI E-Perpus**, asisten virtual cerdas kebanggaan Kejaksaan Negeri Soppeng. Diciptakan khusus untuk membantu dan menemani hari-hari Anda di kantor! ⚖️";
      }
      else if (query.includes("capek") || query.includes("pusing") || query.includes("lelah") || query.includes("ngantuk") || query.includes("mumet")) {
        aiResponse = "Wah, pasti berkas perkara lagi numpuk ya, Bos? Tarik napas panjang, renggangkan badan, dan ngopi dulu tipis-tipis. Kalau butuh buku hiburan atau motivasi, bilang aja ya! Tetap semangat! 💪☕";
      }
      else if (query.includes("pantun") || query.includes("bercanda") || query.includes("lucu") || query.includes("jokes")) {
        aiResponse = "Jalan-jalan ke kota Soppeng,\nJangan lupa mampir ke Kejaksaan.\nKalau kepala Bos sudah mulai pusing,\nMari baca buku di perpustakaan!\n\n*Hehehe, gimana Bos pantun saya? Masuk nggak?* 🦇";
      }
      else if (query.includes("terima kasih") || query.includes("makasih") || query.includes("tq") || query.includes("thanks")) {
        aiResponse = "Sama-sama, Bos! Itu sudah tugas saya. Jangan sungkan ketuk saya lagi kalau butuh sesuatu. Selamat bertugas! 🚀";
      }
      
      // ==========================================
      // 2. LOGIKA CEK STOK & SISTEM PERPUS
      // ==========================================
      else if (query.includes("stok habis") || query.includes("kosong")) {
        const { data } = await supabase.from('books').select('*').lte('stock', 0);
        if (data && data.length > 0) {
          aiResponse = `Laporan diterima! Saat ini ada **${data.length} buku** yang sedang kosong fisiknya. Contohnya: **${data[0].title}**.`;
        } else {
          aiResponse = "Wah, kabar baik! Saat ini tidak ada buku yang stoknya kosong. Semua aman tersedia di rak perpustakaan kita.";
        }
      }
      
      // ==========================================
      // 3. LOGIKA CARI BUKU PINTAR KE DATABASE
      // ==========================================
      else if (query.includes("cari") || query.includes("buku") || query.includes("ada") || query.includes("tentang") || query.includes("pinjam")) {
        
        // Buang kata basa-basi biar sisa kata kunci aslinya
        const keyword = query.replace(/(cari|buku|ada|tentang|dong|tolong|carikan|apakah|punya|mau|pinjam)/gi, "").trim();

        if (!keyword) {
          aiResponse = "Siap Bos! Tapi buku tentang apa spesifiknya yang mau dicarikan?";
        } else {
          const { data } = await supabase
            .from('books')
            .select('*')
            .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%,author.ilike.%${keyword}%`)
            .limit(3); 

          if (data && data.length > 0) {
            aiResponse = `Ketemu nih! Saya menemukan **${data.length} referensi** yang pas untuk "${keyword}":\n\n`;
            data.forEach((b, index) => {
              aiResponse += `${index + 1}. **${b.title}** (Sisa Stok: ${b.stock})\n`;
            });
            aiResponse += `\nSilakan langsung pinjam lewat menu Katalog utama ya, Bos!`;
          } else {
            aiResponse = `Waduh maaf, saya sudah keliling database, tapi tidak menemukan buku tentang **"${keyword}"**. Mungkin ejaannya beda atau kita memang belum punya koleksinya?`;
          }
        }
      } 
      
      // ==========================================
      // 4. FALLBACK (JIKA AI BINGUNG)
      // ==========================================
      else {
        const fallbackResponses = [
          "Hmm, menarik. Tapi fokus saya saat ini bantu cari buku dan nemenin Bos ngobrol. Ada buku yang lagi dicari?",
          "Saya kurang paham maksud Bos yang ini hehe. Coba perintah lain, misal: **'Cari buku pidana'** atau **'bikinin pantun dong'**.",
          "Waduh, bahasa dewa nih. Boleh diperjelas lagi Bos maksudnya? 😂"
        ];
        aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }
    } catch (error) {
      aiResponse = "Aduh maaf Bos, koneksi saya ke database Kejaksaan sedang putus nyambung nih. Kasih saya waktu beberapa detik lalu coba lagi ya.";
    }

    // Simulasi jeda berpikir (seperti manusia mengetik)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
      setIsTyping(false);
    }, Math.floor(Math.random() * 1000) + 800); // Jeda random 0.8 - 1.8 detik biar natural
  };

  return (
    <>
      {/* TOMBOL MENGAPUNG */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 w-14 h-14 bg-gradient-to-r from-[#1B4332] to-[#2d6a4f] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-[60] group border-2 border-white"
        title="Tanya Asisten AI"
      >
        <span className="text-2xl group-hover:animate-bounce">✨</span>
        {!isOpen && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>}
      </button>

      {/* JENDELA CHAT AI */}
      {isOpen && (
        <div className="fixed bottom-36 lg:bottom-28 right-4 lg:right-8 w-[calc(100vw-32px)] sm:w-[380px] h-[500px] max-h-[70vh] bg-white rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header Chat */}
          <div className="bg-gradient-to-r from-[#1B4332] to-[#2d6a4f] p-4 flex items-center justify-between shadow-md z-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl border border-white/30 backdrop-blur-sm shadow-inner">🤖</div>
              <div>
                <h3 className="font-black text-white leading-tight text-sm">E-Perpus AI</h3>
                <p className="text-[9px] text-emerald-100 font-bold tracking-widest uppercase flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online & Siap Bantu
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-2 relative z-10 transition-colors bg-white/10 hover:bg-white/20 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Area Pesan */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#F9FAFB] scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3.5 text-sm shadow-sm leading-relaxed ${
                  msg.role === "user" 
                  ? "bg-[#1B4332] text-white rounded-2xl rounded-tr-sm" 
                  : "bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm"
                }`}>
                  {msg.role === "ai" ? formatText(msg.text) : msg.text}
                </div>
              </div>
            ))}
            
            {/* Animasi Mengetik */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-[#1B4332]/40 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#1B4332]/60 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-[#1B4332] rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Area Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/50 focus:bg-white transition-all text-gray-900"
              placeholder="Tanya buku atau ketik 'pantun'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-[#1B4332] text-white rounded-xl flex items-center justify-center hover:bg-[#123023] disabled:opacity-50 disabled:hover:bg-[#1B4332] transition-colors shadow-md active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>

        </div>
      )}
    </>
  );
}