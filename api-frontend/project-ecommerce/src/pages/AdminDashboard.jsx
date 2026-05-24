import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Check, X, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);

  const loadDataAdmin = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const resUsers = await axios.get('/api/admin/users', { headers });
      const resLoans = await axios.get('/api/admin/loans/pending', { headers });
      setAllUsers(resUsers.data);
      setPendingLoans(resLoans.data);
    } catch (err) {
      console.error("Gagal sinkron data admin:", err);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadDataAdmin();
  }, [user, token]);

  const handleUpdateUser = (selectedUser) => {
    Swal.fire({
      title: `Edit Data ${selectedUser.full_name}`,
      html: `
        <input id="swal-saldo" class="swal2-input bg-slate-900 text-white" value="${selectedUser.balance}" placeholder="Saldo">
        <input id="swal-limit" class="swal2-input" value="${selectedUser.loan_limit}" placeholder="Limit Pinjaman">
      `,
      background: '#111827',
      color: '#fff',
      preConfirm: () => {
        return {
          balance: document.getElementById('swal-saldo').value,
          loan_limit: document.getElementById('swal-limit').value
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.put(`/api/admin/users/${selectedUser.id}`, result.value, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Berhasil!', 'Data user berhasil dirombak admin.', 'success');
        loadDataAdmin();
      }
    });
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-rose-500 font-bold">Akses ditolak bos! Halaman khusus Admin Mbur.</div>;
  }

  return (
    <div className="space-y-8 text-slate-200 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Shield className="text-cyan-400" size={26} /> PANEL KONTROL DEWA (ADMIN)
        </h1>
        <p className="text-xs text-slate-400">Atur validasi persetujuan pinjaman kredit, kelola dana awal pendaftaran customer, dan edit saldo field CRUD.</p>
      </div>

      {/* Manajemen Users (CRUD) */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users size={16} className="text-cyan-400" /> Database Akun Terdaftar
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-3">Nama</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Saldo saat ini</th>
                <th className="p-3 text-right">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/30">
                  <td className="p-3 font-bold text-white">{u.full_name}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3 text-xs uppercase font-mono text-cyan-400">{u.role}</td>
                  <td className="p-3 text-emerald-400 font-bold">Rp {Number(u.balance).toLocaleString('id-ID')}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button onClick={() => handleUpdateUser(u)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                      <Edit size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}