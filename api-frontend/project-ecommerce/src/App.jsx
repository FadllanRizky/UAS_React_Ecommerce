import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Product from './pages/Product';
import Loan from './pages/Loan';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import LiveChatWidget from './components/LiveChatWidget';
import AuthModal from './components/AuthModal';
import { ShoppingCart, LogOut, Wallet, LogIn } from 'lucide-react';

export default function App() {
  const { user, token, logout, setIsAuthModalOpen, setAuthMode, checkAuth } = useAuth();
  
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'products');
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [loanAutoSelectProduct, setLoanAutoSelectProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product) => {
    if (!checkAuth()) return; // Cegah aksi masuk keranjang jika belum login
    setCart((prev) => [...prev, product]);
  };

  const handleRedirectToLoanPage = (product) => {
    if (!checkAuth()) return; // Cegah masuk peminjaman jika belum login
    setLoanAutoSelectProduct(product);
    setActiveTab('loans');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-emerald-500/30">
      
      {/* HEADER NAVBAR */}
      <header className="bg-[#111827] border-b border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-black text-white text-lg tracking-wider cursor-pointer" onClick={() => setActiveTab('products')}>
              MBUR <span className="text-emerald-500">STORE</span>
            </span>
            <nav className="flex gap-1 text-xs font-bold uppercase tracking-wider">
              <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg ${activeTab === 'products' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'}`}>Products</button>
              <button onClick={() => { if(checkAuth()) setActiveTab('loans') }} className={`px-4 py-2 rounded-lg ${activeTab === 'loans' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'}`}>Fasilitas Pinjaman</button>
              <button onClick={() => { if(checkAuth()) setActiveTab('history') }} className={`px-4 py-2 rounded-lg ${activeTab === 'history' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'}`}>Riwayat Saya</button>
              {token && user?.role === 'admin' && (
                <button onClick={() => setActiveTab('admin')} className="px-4 py-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/50">Admin Panel</button>
              )}
            </nav>
          </div>

          {/* SISI KANAN NAVBAR (Dinamis Login / Logged In) */}
          <div className="flex items-center gap-4">
            {!token ? (
              // 🔥 TAMPILKAN TOMBOL MASUK JIKA USER BELUM LOGIN
              <button 
                onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/20"
              >
                <LogIn size={14} /> Masuk / Daftar
              </button>
            ) : (
              // TAMPILKAN SALDO & PROFILE JIKA SUDAH LOGIN
              <>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <Wallet size={14} className="text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Rp {Number(user?.balance || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="relative p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 cursor-pointer">
                  <ShoppingCart size={16} />
                  {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{cart.length}</span>}
                </div>

                <button onClick={logout} className="p-2 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 rounded-xl text-slate-400 hover:text-rose-400 transition-all">
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* AREA KONTEN UTAMA */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {activeTab === 'products' && <Product onAddToCart={handleAddToCart} onAddToLoan={handleRedirectToLoanPage} />}
        {activeTab === 'loans' && token && <Loan autoSelectProduct={loanAutoSelectProduct} clearAutoSelect={() => setLoanAutoSelectProduct(null)} />}
        {activeTab === 'history' && token && <History />}
        {activeTab === 'admin' && token && <AdminDashboard />}
      </main>

      {/* MODAL OTENTIKASI & LIVE CHAT WIDGET */}
      <AuthModal />
      <LiveChatWidget />
    </div>
  );
}