import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, User } from 'lucide-react';
import { loginApi, registerApi } from '../api/authApi'; // 🔥 Import API helper bos
import Swal from 'sweetalert2';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        // 🔥 Menggunakan loginApi bawaan bos (Menembak ke port 3000)
        const res = await loginApi({ email, password });
        login(res.data); // Oper data session & profile ke context
      } else {
        // 🔥 Menggunakan registerApi bawaan bos (Menembak ke port 3000)
        await registerApi({ email, password, full_name: fullName });
        
        Swal.fire({
          title: 'Registrasi Sukses!',
          text: 'Akun bos berhasil dibuat + Dapat Saldo Awal Rp 2.000.000! Silakan cek inbox/spam email asli bos untuk konfirmasi.',
          icon: 'success',
          background: '#111827',
          color: '#FFF',
          confirmButtonColor: '#10B981'
        });
        
        // Reset form data pendaftaran
        setFullName('');
        setAuthMode('login');
      }
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: err.response?.data?.error || err.message || 'Terjadi kesalahan sistem bos',
        icon: 'error',
        background: '#111827',
        color: '#FFF',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-white tracking-wide uppercase">
              {authMode === 'login' ? 'Masuk Akun Bos' : 'Daftar Member Mbur'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Akses platform transaksi & pinjaman instan.</p>
          </div>
          <button 
            onClick={() => setIsAuthModalOpen(false)} 
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input 
                  type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Fadllan Rizky"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="bos@mbur.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : authMode === 'login' ? 'MASUK SEKARANG' : 'DAFTAR & AMBIL Rp 2JT'}
          </button>
        </form>

        {/* Footer Pemindah Mode */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-400">
            {authMode === 'login' ? 'Belum punya akun bos?' : 'Sudah terdaftar sebagai member?'}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-emerald-400 font-bold ml-1 hover:underline"
            >
              {authMode === 'login' ? 'Daftar di sini' : 'Login sekarang'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}