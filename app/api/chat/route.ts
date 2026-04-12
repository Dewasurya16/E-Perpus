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

    let selectedModel = availableModels.find((m: any) => m.name === 'models/gemini-2.5-flash') || 
                        availableModels.find((m: any) => m.name === 'models/gemini-1.5-flash') || 
                        availableModels[0]; 

    const { message, history = [] } = await req.json();
    
    // ==========================================
    // 1. TARIK DATA BUKU DARI SUPABASE
    // ==========================================
    const { data: books, error: booksError } = await supabase.from('books').select('title, author, category, stock, rak');
    
    if (booksError) console.error("Error fetching books:", booksError);

    const catalogContext = books && books.length > 0 
      ? books.map(b => `- Judul: "${b.title}" | Penulis: ${b.author || 'Anonim'} | Kategori: ${b.category || 'Umum'} | Rak: ${b.rak || 'TBA'} | Sisa Stok: ${b.stock}`).join('\n') 
      : 'Saat ini belum ada buku di database.';

    // ==========================================
    // 2. TARIK DATA PEGAWAI DARI SUPABASE 
    // ==========================================
    const { data: staffs, error: staffsError } = await supabase.from('Data Pegawai').select('*');
    
    if (staffsError) console.error("Error fetching staffs:", staffsError);

    const staffContext = staffs && staffs.length > 0
      ? staffs.map((s: any) => {
          const namaPegawai = s.Nama || s.nama || 'Tanpa Nama';
          const jabatanPegawai = s.Jabatan || s.jabatan || 'Pegawai';
          return `- ${namaPegawai} (${jabatanPegawai})`;
        }).join('\n')
      : 'Data staf belum berhasil dimuat dari sistem.';

    // =====================================================================
    // OTAK LEXI: GABUNGAN PREMIUM & EKSEKUTOR LEVEL DEWA
    // =====================================================================
    const systemPrompt = `
Anda adalah "Lexi", Asisten AI E-Perpustakaan Kejaksaan Negeri Soppeng.
Karakter Anda: Sangat ramah, empatik, cerdas, dan luwes. Anda berbicara dengan bahasa Indonesia yang rapi, tidak kaku, layaknya pustakawan profesional yang siap membantu rekan-rekan kejaksaan dengan senyuman.

PANDUAN MENJAWAB (SANGAT PENTING):

1. PENCARIAN BUKU (DETAIL & SMART FILTER):
   - Jika pengguna mencari buku, baca DATA BUKU dengan sangat teliti. Sebutkan maksimal 3-5 buku yang paling relevan.
   - Berikan rinciannya dengan format yang elegan ke bawah:
     Judul: **[Judul Buku]** karya [Penulis]
     Kategori: [Kategori]
     Lokasi Rak: [Rak]
     Sisa Stok: [Stok] eksemplar
   - Tutup informasi buku dengan tawaran (Contoh: "Apakah Bapak/Ibu tertarik meminjamnya? Boleh sebutkan nama Bapak/Ibu agar saya bantu booking langsung dari sini!").

2. EKSEKUSI PEMINJAMAN / BOOKING (FITUR DEWA):
   - Jika pengguna menyatakan ingin meminjam/mem-booking buku, pastikan Anda tahu 2 hal: JUDUL BUKU dan NAMA PEGAWAI.
   - Jika pengguna belum menyebutkan namanya, TANYAKAN dengan ramah: "Tentu, boleh saya tahu nama Bapak/Ibu untuk dicatat di sistem?".
   - JIKA JUDUL BUKU DAN NAMA PEGAWAI SUDAH JELAS, ANDA WAJIB BERHENTI BERBICARA BIASA. Anda HANYA BOLEH membalas dengan KODE JSON murni di bawah ini (tanpa tanda kutip markdown, tanpa kalimat sapaan apapun):
   {"action": "booking", "buku": "[Judul Buku yang dipinjam]", "nama": "[Nama Pegawai]"}

3. PENCARIAN PEGAWAI (INTERAKTIF):
   - Jika pengguna HANYA mengatakan "Saya ingin mencari data pegawai" atau "Info pegawai", JANGAN langsung berikan daftar nama. Tanya balik dengan lembut: "Tentu! Anda ingin mencari pegawai berdasarkan **Nama** atau **Jabatannya**?".
   - Jika ditanya spesifik, cari di DATA PEGAWAI dan sebutkan namanya dengan sopan (tambahkan embel-embel Bapak/Ibu).

4. FITUR UMUM & ATURAN:
   - Aturan Pinjam: 7 hari standar (maks 14 hari). Telat/hilang wajib ganti buku atau denda.
   - Pengetahuan Umum: Jika diajak ngobrol di luar topik perpus, layani dengan ramah.

📚 DATA BUKU: 
${catalogContext}

👥 DATA PEGAWAI KEJAKSAAN NEGERI SOPPENG:
${staffContext}

FORMAT JAWABAN (KECUALI SAAT BOOKING):
- Gunakan huruf tebal (**) untuk judul buku atau nama orang penting.
- DILARANG KERAS menggunakan tanda bintang (*) atau bullet points saat menyebutkan daftar nama pegawai. Gunakan penomoran angka (1., 2., 3.) atau baris baru.
- Gunakan emoji secukupnya agar percakapan terasa hidup.
    `;

    const contents = history.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user', 
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${selectedModel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents, 
        generationConfig: {
          temperature: 0.3, // Suhu diturunkan sedikit agar JSON booking akurat, namun tetap ramah saat ngobrol biasa
          maxOutputTokens: 800,
        }
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("❌ Error dari Google:", data);
      if (data.error?.code === 429) {
        return NextResponse.json({ 
          reply: "Aduh, otak AI saya kepanasan nih! 🤯 Google membatasi kecepatan saya karena terlalu banyak pesan dalam 1 menit. Mohon beri saya waktu istirahat sekitar 1 menit, lalu tanyakan lagi ya." 
        });
      }
      return NextResponse.json({ reply: `Sistem sedang sibuk. Error: ${data.error?.message}` }, { status: 500 });
    }

    let replyText = data.candidates[0].content.parts[0].text;

   // =====================================================================
    // SERVER INTERCEPTOR (KHUSUS TABEL BOOKING_AI)
    // =====================================================================
    try {
      const isBookingAction = replyText.includes('"action"') && replyText.includes('booking');
      
      if (isBookingAction) {
        const regex = /\{[\s\S]*?\}/;
        const jsonMatch = replyText.match(regex);
        
        if (jsonMatch) {
          const command = JSON.parse(jsonMatch[0]);
          
          if (command.action === 'booking' && command.buku && command.nama) {
            
            // MASUKKAN KE TABEL BARU YANG SIMPEL
            const { error: insertError } = await supabase.from('booking_ai').insert([{
              nama: command.nama,
              buku: command.buku
            }]);

            if (insertError) {
              console.error("Gagal Catat Booking:", insertError.message);
              replyText = `Maaf Bapak/Ibu **${command.nama}**, ada sedikit gangguan teknis. Mohon coba lagi sebentar ya.`;
            } else {
              replyText = `✅ **Berhasil Dicatat!**\n\nPemesanan buku **${command.buku}** sudah saya catat di sistem atas nama **Bapak/Ibu ${command.nama}**.\n\nSilakan konfirmasi ke meja layanan E-Perpus untuk pengambilan fisiknya. Ada lagi yang bisa Lexi bantu?`;
            }
          }
        }
      }
    } catch (parseError) {
      console.error("Gagal proses JSON:", parseError);
    }

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error('❌ Error AI Detail:', error.message);
    return NextResponse.json({ reply: `Koneksi ke otak AI terputus. Mohon coba lagi.` }, { status: 500 });
  }
}