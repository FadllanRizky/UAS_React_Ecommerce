import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Product from './pages/Product';
import Loan from './pages/Loan';
import History from './pages/History';
import Profile from './pages/Profile';
import api from './api/axiosInstance';
import Checkout from './pages/Checkout'; 
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
  
  // 🔥 State Baru untuk mengontrol visibility chat panel di halaman Admin
  const [isAdminChatVisible, setIsAdminChatVisible] = useState(false);
  
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

  // 🔥 EFFECT LISTENERS: Sinkronisasi Tombol Balas/Tutup dari AdminDashboard
  useEffect(() => {
    const handleOpenChat = (e) => {
      if (e.detail?.targetUser) {
        setIsAdminChatVisible(true);
      } else {
        setIsAdminChatVisible(false);
      }
    };
    
    const handleCloseChat = () => {
      setIsAdminChatVisible(false);
    };

    window.addEventListener('trigger-mbur-chat', handleOpenChat);
    window.addEventListener('close-mbur-chat', handleCloseChat);

    return () => {
      window.removeEventListener('trigger-mbur-chat', handleOpenChat);
      window.removeEventListener('close-mbur-chat', handleCloseChat);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Validasi cart saat mount: update harga & stok dari API, hapus produk yang sudah tidak ada
  useEffect(() => {
    if (cart.length === 0) return;
    const productIds = cart.map(item => item.id);
    api.get('/products', { params: { ids: productIds.join(',') } })
      .then(res => {
        const products = res.data?.data || res.data?.products || res.data || [];
        if (!Array.isArray(products) || products.length === 0) return;
        setCart(prev => {
          const updated = prev.map(item => {
            const fresh = products.find(p => p.id === item.id);
            if (!fresh) return null;
            return { ...item, price: Number(fresh.price), stok: fresh.stok || fresh.stock, name: fresh.name, image_url: fresh.image_url || item.image_url };
          }).filter(Boolean);
          return updated;
        });
      })
      .catch(() => {});
  }, []);

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

  const handleRedirectToCheckoutPage = () => {
    if (!checkAuth()) return;
    
    if (cart.length === 0) {
      Swal.fire({ title: 'Keranjang Kosong', text: 'Belanja dulu gih bos baru ke checkout!', icon: 'info', background: '#111827', color: '#FFF' });
      return;
    }

    setIsCartOpen(false); 
    setActiveTab('checkout'); 
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  // 👑 1. INTERFACE MANAGEMENT DASHBOARD (ADMIN MODE)
  if (token && user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased selection:bg-blue-500/30">
        <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center max-w-6xl mx-auto mt-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-sm font-black tracking-widest text-gray-800 uppercase">MBUR STORE — DASHBOARD</h1>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }} 
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors"
          >
            LOGOUT ADMIN
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <AdminDashboard />
        </main>

        <AuthModal />
        
        {isAdminChatVisible && (
          <div id="mbur-chat-wrapper" className="[&_button]:hidden animate-in fade-in slide-in-from-bottom duration-200">
            <LiveChatWidget />
          </div>
        )}

        <footer className="bg-white border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-400">
          <p className="font-medium">&copy; 2026 <span className="font-black text-orange-500">MBUR STORE</span> — All rights reserved.</p>
          <p className="mt-1">Dibangun dengan Express.js + React + Supabase</p>
        </footer>
      </div>
    );
  }

  // 👥 2. INTERFACE CUSTOMER REGULER
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased selection:bg-orange-500/30">
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

        {activeTab === 'checkout' && token && (
          <Checkout 
            cart={cart}
            totalAmount={totalAmount}
            clearCart={() => setCart([])}
            setTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && token && <History />}

        {activeTab === 'profile' && token && <Profile />}
      </main>

      <AuthModal />
      
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        setCart={setCart} 
        onCheckout={handleRedirectToCheckoutPage} 
      />
      
      <div id="mbur-chat-wrapper" className="[&_button]:hidden">
        <LiveChatWidget />
      </div>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-xs text-gray-400">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center shadow">
                <span className="text-white font-black text-[10px]">M</span>
              </div>
              <span className="font-black text-sm tracking-tight text-gray-700">MBUR <span className="text-orange-500">STORE</span></span>
            </div>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-orange-500 transition-colors">Tentang</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Kebijakan</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Bantuan</a>
            </div>
          </div>
          <hr className="border-gray-200 my-4" />
          <p>&copy; 2026 MBUR STORE — All rights reserved. Dibangun dengan Express.js + React + Supabase</p>
        </div>
      </footer>
    </div>
  );
}