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
  const { user, token, logout, setIsAuthModalOpen, setAuthMode, checkAuth } = useAuth();
  
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'products');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // 🔥 FIX: Memastikan pembacaan awal localStorage ter-parsing array dengan benar agar tidak hilang saat di-refresh
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
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
      Swal.fire({ 
        title: 'Gagal', 
        text: 'Kuantitas barang harus lebih dari 0 bos!', 
        icon: 'warning', 
        background: '#111827', 
        color: '#FFF' 
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + reqQuantity } : item
        );
      }
      return [...prev, { ...product, quantity: reqQuantity }];
    });

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Masuk keranjang bos!',
      showConfirmButton: false,
      timer: 1500,
      background: '#111827',
      color: '#FFF'
    });
  };

  const handleToggleFavorite = (productId) => {
    if (!checkAuth()) return;
    setFavorites((prev) => {
      const updated = prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId];
      localStorage.setItem('favorites', JSON.stringify(updated)); // Paksa simpan langsung
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
      Swal.fire({ 
        title: 'Saldo Kurang!', 
        text: 'Saldo bos tidak cukup untuk checkout. Ajukan pinjaman aja bos!', 
        icon: 'error', 
        background: '#111827', 
        color: '#FFF' 
      });
      return;
    }
    
    Swal.fire({ 
      title: 'Transaksi Sukses!', 
      text: 'Barang berhasil dibeli menggunakan saldo bos!', 
      icon: 'success', 
      background: '#111827', 
      color: '#FFF' 
    });
    setCart([]);
  };

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
        {activeTab === 'admin' && token && <AdminDashboard />}
      </main>

      <AuthModal />
      
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        setCart={setCart} 
        onCheckout={handleCheckoutViaBalance} 
      />
      
      {/* Wrapper ID untuk menyembunyikan widget tombol bulat kanan bawah */}
      <div id="mbur-chat-wrapper" className="[&_button]:hidden">
        <LiveChatWidget />
      </div>
    </div>
  );
}