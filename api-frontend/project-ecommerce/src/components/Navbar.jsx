import React from 'react';
import { ShoppingCart, LogIn, LogOut, PackageCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ cartCount, onCartClick, currentTab, setTab }) {
  const { token, logout, setIsAuthModalOpen, setAuthMode } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('products')}>
        <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          SLEBEWW STORE
        </span>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setTab('products')} 
          className={`text-sm font-medium transition-colors ${currentTab === 'products' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          Products
        </button>

        {token && (
          <button 
            onClick={() => setTab('loans')} 
            className={`text-sm font-medium flex items-center gap-1 transition-colors ${currentTab === 'loans' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
          >
            <PackageCheck size={16} /> Loans
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-800"></div>

        {/* Cart Trigger */}
        <button onClick={onCartClick} className="relative p-2 text-slate-400 hover:text-white transition-colors group">
          <ShoppingCart size={22} className="group-hover:scale-105 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
              {cartCount}
            </span>
          )}
        </button>

        {/* Auth Button Tergantung Token */}
        {token ? (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              Bos Active
            </span>
            <button onClick={logout} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
            className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-950/20"
          >
            <LogIn size={15} /> Login
          </button>
        )}
      </div>
    </nav>
  );
}