'use client';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ── Tipe ─────────────────────────────────────────────────────
type BukuTamuEntry = {
  id: string;
  nama: string;
  bidang?: string | null;
  asal_instansi?: string | null;
  keperluan: string;
  pesan?: string | null;
  ttd_data?: string | null;
  status: string;
  created_at: string;
};

// ── Helper ────────────────────────────────────────────────────
function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTanggalPendek(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTanggalFormal(date = new Date()) {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getBidang(e: BukuTamuEntry) {
  return e.bidang || e.asal_instansi || '—';
}

// ── Modal TTD Pegawai ─────────────────────────────────────────
function PegawaiSignaturePad({
  onConfirm,
  onCancel,
}: {
  onConfirm: (data: { nama: string; nip: string; ttdDataUrl: string | null }) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [namaPegawai, setNamaPegawai] = useState('');
  const [nipPegawai, setNipPegawai] = useState('');
  const [ttdDataUrl, setTtdDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f2a1c';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      if ('touches' in e) {
        return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
      }
      return { x: ((e as MouseEvent).clientX - rect.left) * sx, y: ((e as MouseEvent).clientY - rect.top) * sy };
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault(); isDrawing.current = true;
      const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y);
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault(); if (!isDrawing.current) return;
      const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); setIsEmpty(false);
    };
    const onEnd = () => {
      if (!isDrawing.current) return; isDrawing.current = false;
      setTtdDataUrl(canvas.toDataURL('image/png'));
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);
    return () => {
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onEnd);
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onEnd);
    };
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true); setTtdDataUrl(null);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-[#0f2a1c] to-[#1B4332]">
          <h3 className="text-base font-black text-white">Tanda Tangan Petugas</h3>
          <p className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest mt-0.5">
            Untuk dokumen PDF resmi
          </p>
        </div>
        <div className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nama Petugas</label>
              <input
                type="text" value={namaPegawai} onChange={(e) => setNamaPegawai(e.target.value)}
                placeholder="Nama lengkap..."
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">NIP</label>
              <input
                type="text" value={nipPegawai} onChange={(e) => setNipPegawai(e.target.value)}
                placeholder="NIP..."
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Tanda Tangan Petugas
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">✍️ Tanda tangani di sini</p>
                </div>
              )}
              <canvas ref={canvasRef} width={400} height={100} className="w-full cursor-crosshair touch-none block" style={{ height: 100 }} />
            </div>
            {!isEmpty && (
              <button type="button" onClick={handleClear} className="mt-1.5 text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest">
                ↺ Ulangi
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all tracking-widest">
              Lewati
            </button>
            <button
              onClick={() => onConfirm({ nama: namaPegawai, nip: nipPegawai, ttdDataUrl })}
              className="flex-1 py-3 bg-[#1B4332] text-white rounded-xl font-black text-[10px] uppercase hover:bg-[#143628] transition-all tracking-widest"
            >
              Cetak PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama ────────────────────────────────────────────
export default function ExportBukuTamu({ entries }: { entries: BukuTamuEntry[] }) {
  const [mounted, setMounted] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── EXPORT EXCEL ─────────────────────────────────────────────
  const handleExportExcel = () => {
    const rows = entries.map((e, i) => ({
      'No': i + 1,
      'Tanggal': formatTanggal(e.created_at),
      'Nama': e.nama,
      'Bidang / Instansi': getBidang(e),
      'Keperluan / Tujuan': e.keperluan,
      'Kritik / Saran': e.pesan || '—',
      'Status': e.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 40 }, { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Buku Tamu');

    const infoData = [
      ['BUKU TAMU PERPUSTAKAAN', ''],
      ['Kejaksaan Negeri Soppeng', ''],
      ['Dicetak pada:', formatTanggalFormal()],
      ['Total Kunjungan:', entries.length],
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    wsInfo['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Info');

    XLSX.writeFile(wb, `BukuTamu_KejariSoppeng_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ── EXPORT PDF (Gaya Desain "Nomor 2") ──────────────────────
  const generatePDF = ({
    nama: namaPegawai,
    nip: nipPegawai,
    ttdDataUrl,
  }: {
    nama: string;
    nip: string;
    ttdDataUrl: string | null;
  }) => {
    setShowSignModal(false);

    // Kertas Landscape agar tabel Buku Tamu yang panjang bisa muat sempurna
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;

    // ── Fungsi Header Bersih (Style Nomor 2) ──
    const drawHeader = (isFirstPage: boolean) => {
      if (!isFirstPage) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Buku Tamu Perpustakaan (Lanjutan)', pageW / 2, margin - 5, { align: 'center' });
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, margin - 2, pageW - margin, margin - 2);
        return;
      }

      // --- JUDUL DOKUMEN ---
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('REKAPITULASI BUKU TAMU PERPUSTAKAAN', pageW / 2, margin + 5, { align: 'center' });
      
      doc.setFontSize(11);
      doc.text('KEJAKSAAN NEGERI SOPPENG', pageW / 2, margin + 11, { align: 'center' });

      // Periode / Tanggal
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const tanggalCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Dicetak pada: ${tanggalCetak}`, pageW / 2, margin + 17, { align: 'center' });

      // Garis Pemisah Halus
      doc.setDrawColor(50, 50, 50);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 22, pageW - margin, margin + 22);
    };

    // ── Data Tabel ────────────────────────────────────────────
    const tableHead = [['No', 'Tanggal', 'Nama Pengunjung', 'Bidang / Instansi', 'Keperluan / Tujuan', 'Kritik / Saran', 'Tanda Tangan']];
    const tableBody: any[][] = entries.map((e, i) => [
      i + 1,
      formatTanggalPendek(e.created_at),
      e.nama,
      getBidang(e),
      e.keperluan,
      e.pesan || '—',
      '', // TTD placeholder agar baris punya ruang
    ]);

    // ── Render Tabel Rapi ─────────────────────────────────────
    autoTable(doc, {
      startY: margin + 28, // Mulai tepat di bawah garis pemisah
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 9,
        cellPadding: { top: 4, right: 4, bottom: 4, left: 4 }, // Jarak tulisan lega
        valign: 'middle',
        textColor: [40, 40, 40],
        lineColor: [210, 220, 215], // Garis abu-abu kehijauan lembut
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [27, 67, 50], // Hijau Kejaksaan
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineColor: [27, 67, 50],
        lineWidth: 0.1,
      },
      columnStyles: {
        // Total Lebar Kertas A4 Landscape = 297mm. Sisa untuk tabel = 267mm.
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 45 },
        5: { cellWidth: 80 }, // Ruang paling besar untuk membaca kritik/saran
        6: { cellWidth: 32, halign: 'center' },
      },
      alternateRowStyles: { fillColor: [248, 250, 249] }, // Baris selang-seling warna soft
      margin: { left: margin, right: margin },
      
      // Sisipkan gambar tanda tangan asli dari pengunjung ke dalam sel PDF
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 6 && data.row.index !== undefined) {
          const entry = entries[data.row.index];
          if (entry?.ttd_data) {
            try {
              const cellW = data.cell.width;
              const cellH = data.cell.height;
              // Batasi ukuran gambar TTD
              const imgW = Math.min(cellW - 4, 26);
              const imgH = Math.min(cellH - 4, 12);
              const imgX = data.cell.x + (cellW - imgW) / 2;
              const imgY = data.cell.y + (cellH - imgH) / 2;
              doc.addImage(entry.ttd_data, 'PNG', imgX, imgY, imgW, imgH);
            } catch (_) { /* skip jika TTD gagal dimuat */ }
          }
        }
      },
      didDrawPage: (data) => {
        drawHeader(data.pageNumber === 1);
      },
    });

    let finalY = (doc as any).lastAutoTable?.finalY ?? margin + 28;

    // ── Bagian Tanda Tangan Pengesahan ────────────────────────
    if (finalY > pageH - 45) {
      doc.addPage();
      drawHeader(false);
      finalY = margin + 15;
    }

    const signWidth = 60;
    const signX = pageW - margin - signWidth; // Diposisikan rata kanan margin
    const signY = finalY + 15;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    
    const tglFormal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Soppeng, ${tglFormal}`, signX + (signWidth/2), signY, { align: 'center' });
    doc.text('Petugas Perpustakaan,', signX + (signWidth/2), signY + 6, { align: 'center' });
    
    // Jika petugas membubuhkan TTD dari modal, tempel di sini
    if (ttdDataUrl) {
      try {
        doc.addImage(ttdDataUrl, 'PNG', signX + (signWidth/2) - 20, signY + 8, 40, 15);
      } catch (_) { /* skip */ }
    }

    // Garis untuk nama & NIP
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.3);
    doc.line(signX, signY + 28, signX + signWidth, signY + 28);
    
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text(namaPegawai || '(                                             )', signX + (signWidth/2), signY + 32, { align: 'center' });
    
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    if (nipPegawai) {
      doc.text(`NIP. ${nipPegawai}`, signX + (signWidth/2), signY + 36, { align: 'center' });
    }

    // ── FOOTER NOMOR HALAMAN ──────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Halaman ${i} dari ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
    }

    doc.save(`BukuTamu_KejariSoppeng_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
        {/* Tombol Excel */}
        <button
          onClick={handleExportExcel}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 bg-white text-[#1B4332] border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="text-base">📊</span> Excel
        </button>

        {/* Tombol PDF Resmi */}
        <button
          onClick={() => setShowSignModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 bg-[#1B4332] hover:bg-[#143628] text-white border border-[#143628] rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:shadow-emerald-900/20 active:scale-95"
        >
          <span className="text-base">📄</span> Cetak PDF
        </button>
      </div>

      {/* Modal TTD Pegawai */}
      {mounted && showSignModal && createPortal(
        <PegawaiSignaturePad
          onConfirm={generatePDF}
          onCancel={() => {
            setShowSignModal(false);
            generatePDF({ nama: '', nip: '', ttdDataUrl: null });
          }}
        />,
        document.body
      )}
    </>
  );
}