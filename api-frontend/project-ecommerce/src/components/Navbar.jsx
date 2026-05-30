import React from 'react';
import { ShoppingCart, LogIn, LogOut, PackageCheck, History, Wallet, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ cartCount, onCartClick, currentTab, setTab, favoriteCount }) {
  const { user, token, logout, setIsAuthModalOpen, setAuthMode } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center transition-all duration-300">
      
      {/* KIRI: Logo Brand Mbur Store */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('products')}>
        <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          MBUR <span className="text-white">STORE</span>
        </span>
      </div>

      {/* TENGAH: Menu Navigasi Tab Utama */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
        <button 
          onClick={() => setTab('products')} 
          className={`px-4 py-2 rounded-xl transition-all ${currentTab === 'products' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-white'}`}
        >
          Products
        </button>

        {token && (
          <>
            <button 
              onClick={() => setTab('loans')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${currentTab === 'loans' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-white'}`}
            >
              <PackageCheck size={14} /> Fasilitas Pinjaman
            </button>
            
            <button 
              onClick={() => setTab('history')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${currentTab === 'history' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-white'}`}
            >
              <History size={14} /> Riwayat Saya
            </button>
          </>
        )}

        {/* Akses Khusus Admin Dashboard */}
        {token && user?.role === 'admin' && (
          <button 
            onClick={() => setTab('admin')} 
            className={`px-4 py-2 rounded-xl transition-all ${currentTab === 'admin' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/50' : 'text-cyan-500/70 hover:text-cyan-400'}`}
          >
            Admin Panel
          </button>
        )}
      </div>

      {/* KANAN: Saldo, Favorit, Keranjang & Akun Log */}
      <div className="flex items-center gap-4">
        
        {/* Jika belum Login, munculkan tombol Masuk / Daftar */}
        {!token ? (
          <button 
            onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
            className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/20"
          >
            <LogIn size={15} /> Masuk / Daftar
          </button>
        ) : (
          // Jika sudah Login, render Status Saldo & Keranjang Belanjaan
          <>
            {/* Widget Saldo Dompet Digital */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl select-none">
              <Wallet size={14} className="text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Rp {Number(user?.balance || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Indikator Jumlah Produk Terfavorit */}
            {favoriteCount > 0 && (
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-rose-400 flex items-center gap-1 text-xs font-bold">
                <Heart size={14} fill="#F43F5E" />
                <span>{favoriteCount}</span>
              </div>
            )}

            <div className="h-4 w-[1px] bg-slate-800"></div>

            {/* Trigger Pembukaan Sidebar/Modal Keranjang Belanja */}
            <button 
              onClick={onCartClick} 
              className="relative p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:border-emerald-500 hover:text-white transition-colors group"
            >
              <ShoppingCart size={16} className="group-hover:scale-105 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Tombol Logout Akun */}
            <button 
              onClick={logout} 
              className="p-2 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 rounded-xl text-slate-400 hover:text-rose-400 transition-all"
              title="Keluar Akun"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}