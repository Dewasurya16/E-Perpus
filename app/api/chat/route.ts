import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase'; 

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "Sistem mendeteksi API Key kosong. Cek file .env.local dan restart server." 
      });
    }

    // Auto-Scanner: Supaya aman kalau nanti Google update model lagi
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsRes.json();

    if (!modelsRes.ok) {
      return NextResponse.json({ reply: `Gagal cek model Google: ${modelsData.error?.message}` }, { status: 500 });
    }

    const availableModels = modelsData.models.filter((m: any) => 
      m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini')
    );

    if (availableModels.length === 0) {
      return NextResponse.json({ reply: "Google belum membuka akses model Gemini untuk akun ini." }, { status: 500 });
    }

    // AI sekarang tahu harus pakai versi 2.5 Flash
    let selectedModel = availableModels.find((m: any) => m.name === 'models/gemini-2.5-flash') || 
                        availableModels.find((m: any) => m.name === 'models/gemini-1.5-flash') || 
                        availableModels[0]; 

    const { message } = await req.json();
    const { data: books } = await supabase.from('books').select('title, author, category, stock, rak');

    const catalogContext = books?.map(b => 
      `- "${b.title}" oleh ${b.author || 'Anonim'} (Rak: ${b.rak || 'TBA'}, Stok: ${b.stock})`
    ).join('\n') || 'Saat ini belum ada buku di database.';

    // =====================================================================
    // DOKTRIN BARU: AI DIAJARKAN CARA BERSOSIALISASI & MENJAWAB
    // =====================================================================
    const systemPrompt = `
      Kamu adalah "Asisten E-Perpus", AI cerdas milik Kejaksaan Republik Indonesia.
      Tugasmu adalah membantu pegawai mencari buku, memberi tahu lokasi rak, dan menjelaskan aturan.
      Jawablah dengan bahasa Indonesia yang profesional, ramah, lugas, dan tidak kaku layaknya robot kuno.

      ATURAN PERPUSTAKAAN:
      - Durasi Pinjam: Standar 7 hari, maksimal 14 hari.
      - Jika hilang/rusak: Wajib ganti buku yang sama atau denda sesuai SK.
      
      DATA BUKU DI PERPUSTAKAAN SAAT INI:
      ${catalogContext}

      Pesan Pegawai: "${message}"
      
      INSTRUKSI PENTING DALAM MENJAWAB: 
      1. Jika pesan pegawai HANYA BERUPA SAPAAN (contoh: "Halo", "Pagi", "Hai", "Tes"), maka balaslah sapaan tersebut dengan ramah dan tanyakan apa yang bisa kamu bantu hari ini. JANGAN mencari sapaan tersebut di dalam DATA BUKU.
      2. Jika pegawai bertanya tentang buku, barulah kamu cari kecocokannya di DATA BUKU. Sebutkan judul, sisa stok, dan lokasi raknya agar mudah dicari.
      3. Jika pegawai bertanya tentang buku namun tidak ada di DATA BUKU, sampaikan mohon maaf bahwa buku tersebut belum tersedia di katalog.
      4. Jika ditanya soal aturan peminjaman atau denda, jawab berdasarkan ATURAN PERPUSTAKAAN di atas.
    `;

    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${selectedModel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("❌ Error dari Google:", data);
      return NextResponse.json({ reply: `Pesan dari Google: ${data.error?.message}` }, { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error('❌ Error AI Detail:', error.message);
    return NextResponse.json({ reply: `Sistem Error: ${error.message}` }, { status: 500 });
  }
}