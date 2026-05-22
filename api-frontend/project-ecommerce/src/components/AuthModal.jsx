import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loginApi, registerApi } from '../api/authApi';
import Swal from 'sweetalert2';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    login
  } = useAuth();

  const [fullName, setFullName] = useState(''); // ✅ TAMBAH
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (authMode === 'login') {
        const response = await loginApi({ email, password });
        login(response.data);
      } else {
        await registerApi({
          full_name: fullName, // ✅ FIX
          email,
          password
        });

        Swal.fire({
          title: 'Registrasi Sukses!',
          text: 'Akun berhasil dibuat, silakan login bos 🔥',
          icon: 'success',
          background: '#111827',
          color: '#FFF',
          confirmButtonColor: '#10B981'
        });

        // reset form
        setFullName('');
        setEmail('');
        setPassword('');

        setAuthMode('login');
      }
    } catch (error) {
      Swal.fire({
        title: 'Gagal!',
        text: error.response?.data?.error || 'Terjadi kesalahan',
        icon: 'error',
        background: '#111827',
        color: '#FFF',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">

        {/* CLOSE */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* TITLE */}
        <h3 className="text-xl font-black text-white">
          {authMode === 'login' ? 'MASUK AKUN' : 'DAFTAR AKUN'}
        </h3>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* 🔥 FULL NAME (REGISTER ONLY) */}
          {authMode === 'register' && (
            <div>
              <label className="text-xs text-slate-400">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button className="w-full bg-emerald-500 py-3 rounded-xl text-white font-bold">
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>

        </form>

        {/* SWITCH MODE */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {authMode === 'login' ? (
            <p>
              Belum punya akun?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-emerald-400"
              >
                Daftar
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="text-emerald-400"
              >
                Login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}