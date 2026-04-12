'use client';

import { useState, useEffect } from 'react';

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 const fetchBookings = async () => {
    setLoading(true);
    try {
      // Kita tambahkan timestamp agar browser tidak ambil cache lama
      const res = await fetch(`/api/booking-list?t=${Date.now()}`);
      
      if (!res.ok) throw new Error("Gagal mengambil data dari API");
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        console.error("Format data salah:", data);
      }
    } catch (error) {
      console.error("Error Detail:", error);
      alert("Gagal refresh data. Cek console browser untuk detailnya.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Log Booking Lexi AI</h1>
            <p className="text-gray-500">Daftar pesanan buku via Chatbot</p>
          </div>
          <button 
            onClick={fetchBookings}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2"
          >
            {loading ? 'Memuat...' : '🔄 Refresh Data'}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Waktu</th>
                <th className="px-6 py-4 font-semibold">Nama Pegawai</th>
                <th className="px-6 py-4 font-semibold">Judul Buku</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length > 0 ? bookings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.tanggal).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-gray-700 italic">"{item.buku}"</td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                      Pending
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                    Belum ada data booking. Silakan coba chat dengan Lexi!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}