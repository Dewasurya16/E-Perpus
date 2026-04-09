"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MyHistory({ userEmail }: { userEmail: string }) {
  const [myLoans, setMyLoans] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyLoans = async () => {
      const { data } = await supabase
        .from("loans")
        .select("*, books(title)")
        .eq("employee_name", userEmail) // Asumsi email digunakan sebagai pengenal
        .order("loan_date", { ascending: false });
      if (data) setMyLoans(data);
    };
    fetchMyLoans();
  }, [userEmail]);

  if (myLoans.length === 0) return null;

  return (
    <section className="mt-12 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#1B4332] rounded-full"></span>
        Riwayat Pinjaman Saya
      </h2>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px]">Buku</th>
                <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px]">Tgl Pinjam</th>
                <th className="px-6 py-3 font-bold text-gray-500 uppercase text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myLoans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-6 py-4 font-bold text-gray-900">{loan.books?.title}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(loan.loan_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${loan.status === 'Dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}