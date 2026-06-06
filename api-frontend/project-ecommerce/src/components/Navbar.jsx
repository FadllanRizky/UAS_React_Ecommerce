import React from 'react';
import { ShoppingCart, LogIn, LogOut, PackageCheck, History, Wallet, Heart, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ cartCount, onCartClick, currentTab, setTab, favoriteCount }) {
  const { user, token, logout, setIsAuthModalOpen, setAuthMode } = useAuth();

  // Cek apakah user login sebagai admin
  const isAdmin = token && user?.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center transition-all duration-300">
      
      {/* 🏷️ KIRI: Logo Brand */}
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => setTab(isAdmin ? 'admin' : 'products')}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
          <span className="text-white font-black text-xs">M</span>
        </div>
        <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          MBUR <span className="text-white">STORE</span>
        </span>
      </div>

      {/* 🧭 TENGAH: Menu Navigasi Adaptif */}
      <div className="hidden md:flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
        
        {/* MENU KHUSUS ADMIN */}
        {isAdmin ? (
          <button 
            onClick={() => setTab('admin')} 
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all ${currentTab === 'admin' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-cyan-500 hover:bg-cyan-500/10'}`}
          >
            <LayoutDashboard size={14} /> Kontrol Dashboard
          </button>
        ) : (
          /* MENU KHUSUS CUSTOMER / GUEST */
          <>
            <button 
              onClick={() => setTab('products')} 
              className={`px-5 py-2.5 rounded-xl transition-all ${currentTab === 'products' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-white'}`}
            >
              Etalase
            </button>

            {token && (
              <>
                <button 
                  onClick={() => setTab('loans')} 
                  className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all ${currentTab === 'loans' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-white'}`}
                >
                  <PackageCheck size={14} /> Pinjaman
                </button>
                
                <button 
                  onClick={() => setTab('history')} 
                  className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all ${currentTab === 'history' ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-white'}`}
                >
                  <History size={14} /> Riwayat
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* 🛠️ KANAN: User Actions */}
      <div className="flex items-center gap-3">
        
        {!token ? (
          /* Tombol Login untuk Guest */
          <button 
            onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
            className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-xl shadow-emerald-500/10"
          >
            <LogIn size={15} /> Authenticate
          </button>
        ) : (
          /* Area User Logged In */
          <div className="flex items-center gap-3">
            
            {/* Badge Status & Saldo (Hanya Customer) */}
            {!isAdmin ? (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
                  <Wallet size={14} className="text-emerald-400" />
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    Rp {Number(user?.balance || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {favoriteCount > 0 && (
                  <button className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 flex items-center gap-1.5 hover:bg-rose-500 hover:text-white transition-all">
                    <Heart size={15} fill="currentColor" />
                    <span className="text-xs font-black">{favoriteCount}</span>
                  </button>
                )}

                <button 
                  onClick={onCartClick} 
                  className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:border-emerald-500 hover:text-white transition-all group"
                >
                  <ShoppingCart size={16} className="group-hover:rotate-12" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0F172A] animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              /* Indikator Mode Admin */
              <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">System Administrator</span>
              </div>
            )}

            <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

            {/* Logout Button */}
            <button 
              onClick={logout} 
              className="p-2.5 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl text-slate-400 hover:text-rose-500 transition-all group"
              title="Keluar"
            >
              <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}