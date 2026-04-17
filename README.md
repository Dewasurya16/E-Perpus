# 📚 E-Perpustakaan Kejaksaan Negeri Soppeng

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-blue?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)

Aplikasi Manajemen Perpustakaan Digital modern yang dirancang khusus untuk internal **Kejaksaan Negeri Soppeng**. Sistem ini mengintegrasikan kecerdasan buatan (AI) untuk mempermudah pelayanan sirkulasi buku bagi para pegawai.

---

## 🌟 Fitur Utama

### 🤖 1. Lexi - AI Librarian Assistant
Fitur unggulan yang memungkinkan pegawai melakukan **booking buku melalui chat**. Lexi dapat:
- Mencari judul buku secara cerdas.
- Memverifikasi data pegawai secara otomatis.
- Melakukan transaksi peminjaman langsung ke database.
- Memberikan informasi tenggat waktu pengembalian.

### 📋 2. Buku Tamu Digital & Export PDF
Sistem pencatatan kunjungan harian yang dilengkapi dengan fitur:
- Formulir kunjungan untuk tamu dan pegawai.
- **Export Laporan PDF** secara instan dengan format resmi untuk pelaporan pimpinan.

### 📊 3. Dashboard Admin & Sirkulasi
- Manajemen data buku (stok, kategori, lokasi rak).
- Pemantauan status peminjaman (Dipinjam/Dikembalikan).
- Manajemen data pegawai internal.

---

## 🛠️ Arsitektur Teknologi

- **Frontend:** Next.js 15 (App Router) & Tailwind CSS.
- **Backend as a Service:** Supabase (PostgreSQL & Auth).
- **AI Core:** Google Gemini AI SDK (Gemini 1.5/2.0 Flash).
- **PDF Engine:** jsPDF & jsPDF-AutoTable.
- **State Management:** React Hooks (useState, useEffect).

---

## 🚀 Cara Instalasi Lokal

1. **Clone Repositori**
   ```bash
   git clone [https://github.com/username/perpustakaan-kantor.git](https://github.com/username/perpustakaan-kantor.git)
   cd perpustakaan-kantor
