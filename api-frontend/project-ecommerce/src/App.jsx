import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Product from './pages/Product';
import Loan from './pages/Loan';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import LiveChatWidget from './components/LiveChatWidget';
import AuthModal from './components/AuthModal';
import CartModal from './components/CartModal';
import Navbar from './components/Navbar'; 
import Swal from 'sweetalert2';

export default function App() {
  const { user, token, checkAuth } = useAuth();
  
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'products');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) { return []; }
  });
  const [loanAutoSelectProduct, setLoanAutoSelectProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleAddToCart = (product, reqQuantity = 1) => {
    if (!checkAuth()) return;
    if (reqQuantity <= 0) {
      Swal.fire({ title: 'Gagal', text: 'Kuantitas barang harus lebih dari 0 bos!', icon: 'warning', background: '#111827', color: '#FFF' });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: (item.quantity || 1) + reqQuantity } : item);
      }
      return [...prev, { ...product, quantity: reqQuantity }];
    });
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Masuk keranjang bos!', showConfirmButton: false, timer: 1500, background: '#111827', color: '#FFF' });
  };

  const handleToggleFavorite = (productId) => {
    if (!checkAuth()) return;
    setFavorites((prev) => {
      const updated = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRedirectToLoanPage = (product) => {
    if (!checkAuth()) return;
    setLoanAutoSelectProduct(product);
    setActiveTab('loans');
  };

  const handleCheckoutViaBalance = (total) => {
    if (user?.balance < total) {
      Swal.fire({ title: 'Saldo Kurang!', text: 'Saldo bos tidak cukup untuk checkout. Ajukan pinjaman aja bos!', icon: 'error', background: '#111827', color: '#FFF' });
      return;
    }
    Swal.fire({ title: 'Transaksi Sukses!', text: 'Barang berhasil dibeli menggunakan saldo bos!', icon: 'success', background: '#111827', color: '#FFF' });
    setCart([]);
  };

  // 🔥 1. CEK OTORISASI: Jika user adalah admin, render interface panel kontrol eksklusif secara penuh
  if (token && user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-cyan-500/30">
        {/* Simple Header khusus admin untuk tombol Keluar */}
        <header className="bg-[#111827] border-b border-slate-800 px-6 py-4 flex justify-between items-center max-w-6xl mx-auto mt-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-sm font-black tracking-widest text-white uppercase">MBUR SYSTEM DASHBOARD v2.0</h1>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }} 
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            LOGOUT ADMIN
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <AdminDashboard />
        </main>

        <AuthModal />
        
        {/* Widget chat diletakkan di luar agar bisa dipanggil lewat trigger custom-event */}
        <div id="mbur-chat-wrapper" className="[&_button]:hidden">
          <LiveChatWidget />
        </div>
      </div>
    );
  }

  // 👥 2. INTERFACE CUSTOMER REGULER: Tampilan toko jika status user bukan admin
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-emerald-500/30">
      <Navbar 
        cartCount={cart.reduce((acc, item) => acc + (item.quantity || 1), 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        currentTab={activeTab} 
        setTab={setActiveTab}
        favoriteCount={favorites.length}
      />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {activeTab === 'products' && (
          <Product 
            onAddToCart={handleAddToCart} 
            onAddToLoan={handleRedirectToLoanPage} 
            favorites={favorites} 
            onToggleFavorite={handleToggleFavorite} 
          />
        )}
        {activeTab === 'loans' && token && (
          <Loan 
            autoSelectProduct={loanAutoSelectProduct} 
            clearAutoSelect={() => setLoanAutoSelectProduct(null)} 
          />
        )}
        {activeTab === 'history' && token && <History />}
      </main>

      <AuthModal />
      
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        setCart={setCart} 
        onCheckout={handleCheckoutViaBalance} 
      />
      
      <div id="mbur-chat-wrapper" className="[&_button]:hidden">
        <LiveChatWidget />
      </div>
    </div>
  );
}