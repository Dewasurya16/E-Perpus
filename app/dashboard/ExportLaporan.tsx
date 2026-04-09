'use client';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Perbaikan import di sini

export default function ExportLaporan({ dataBuku, dataPinjam }: { dataBuku: any[], dataPinjam: any[] }) {
  
  const handleExportExcel = () => {
    const bukuExport = dataBuku.map((b, i) => ({
      'No': i + 1, 'Judul Buku': b.title, 'Kategori': b.category, 'Sisa Stok': b.stock
    }));
    const pinjamExport = dataPinjam.map((p, i) => ({
      'No': i + 1, 'Nama Peminjam': p.employee_name, 'Buku': p.books?.title, 'Tenggat': new Date(p.due_date).toLocaleDateString('id-ID'), 'Status': p.status
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pinjamExport), "Sirkulasi");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bukuExport), "Katalog");
    XLSX.writeFile(wb, `Laporan_E-Perpus_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Laporan Sirkulasi E-Perpus Kejaksaan RI", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableData = dataPinjam.map((p, i) => [
      i + 1, p.employee_name, p.books?.title || '-', new Date(p.due_date).toLocaleDateString('id-ID'), p.status
    ]);

    // Gunakan fungsi autoTable secara langsung
    autoTable(doc, {
      startY: 28,
      head: [['No', 'Nama Peminjam', 'Buku Dipinjam', 'Tenggat Waktu', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [27, 67, 50] } 
    });

    doc.save(`Laporan_E-Perpus_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
      <button onClick={handleExportExcel} className="flex-1 lg:flex-none justify-center bg-white text-[#1B4332] hover:bg-emerald-50 px-6 py-3.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg hover:-translate-y-1">
        <span>📊</span> Excel Laporan
      </button>
      <button onClick={handleExportPDF} className="flex-1 lg:flex-none justify-center bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:-translate-y-1 cursor-pointer">
        <span>📄</span> Unduh PDF
      </button>
    </div>
  );
}