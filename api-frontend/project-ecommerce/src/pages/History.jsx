import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, ArrowUpLeft, ArrowDownRight } from 'lucide-react';
import axios from 'axios';

export default function History() {
  const { token } = useAuth();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    axios.get('/api/transactions/my-history', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        let extractedHistory = [];
        
        // 🔥 Penyelamat dari error ".map is not a function" (Ekstraksi Array Aman)
        if (Array.isArray(response.data)) {
          extractedHistory = response.data;
        } else if (response.data && Array.isArray(response.data.rows)) {
          extractedHistory = response.data.rows;
        } else if (response.data && Array.isArray(response.data.data)) {
          extractedHistory = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          extractedHistory = response.data.history || Object.values(response.data).find(Array.isArray) || [];
        }
        
        setHistories(extractedHistory);
      })
      .catch((err) => {
        console.error("Gagal load history transaksi:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-slate-200">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Clock className="text-emerald-400" size={24} /> HISTORI MUTASI & TRANSAKSI
        </h1>
        <p className="text-xs text-slate-400 mt-1">Pantau semua histori belanja, penambahan saldo, dan pembayaran pinjaman bos.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Memuat mutasi keuangan bos...</span>
          </div>
        ) : histories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Belum ada mutasi keuangan masuk/keluar di akun bos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Jenis Transaksi</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4">Metode</th>
                  <th className="p-4 text-right">Nominal (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {histories.map((h, i) => {
                  // Cek apakah transaksi bersifat menambah uang masuk
                  const isPlus = h.type === 'loan_disbursement' || h.type === 'deposit';
                  return (
                    <tr key={h.id || i} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 text-xs text-slate-500 font-mono">
                        {h.created_at ? new Date(h.created_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border ${
                          isPlus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {isPlus ? <ArrowDownRight size={12} /> : <ArrowUpLeft size={12} />}
                          {h.type || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-white">{h.description || 'Tidak ada deskripsi'}</td>
                      <td className="p-4 text-xs text-slate-400 font-bold">{h.payment_method || 'CASH'}</td>
                      <td className={`p-4 text-right font-bold ${isPlus ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPlus ? '+' : '-'} Rp {Number(h.amount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}