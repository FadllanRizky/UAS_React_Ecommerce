import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Product from './pages/Product';
import Loan from './pages/Loan';
import ProductDetailModal from './components/ProductDetailModal';
import CartModal from './components/CartModal';
import AuthModal from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';
import { createLoan } from './api/loanApi';
import Swal from 'sweetalert2';

export default function App() {
  const { checkAuth, token } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product) => {
    if (!checkAuth()) return; // Trigger SweetAlert proteksi jika belum masuk/login

    setCart((prev) => {
      const productId = product.id || product._id;
      const existing = prev.find((item) => (item.id || item._id) === productId);
      if (existing) {
        return prev.map((item) => (item.id || item._id) === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Pop-up notifikasi sukses tambah ke keranjang
    Swal.fire({
      title: 'Berhasil Masuk Keranjang!',
      text: `${product.name} telah berhasil ditambahkan, bos.`,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      background: '#111827',
      color: '#E2E8F0',
    });
  };

  const handleAddToLoan = (product) => {
    if (!checkAuth()) return;
    
    Swal.fire({
      title: 'Ajukan Pinjaman?',
      text: `Apakah bos yakin ingin meminjam ${product.name}?`,
      icon: 'question',
      showCancelButton: true,
      background: '#111827',
      color: '#E2E8F0',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Ya, Ajukan!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Menembak endpoint axios createLoan milikmu menggunakan parameter (data, token)
        createLoan({ productId: product.id || product._id, durationDays: 14 }, token)
          .then(() => {
            Swal.fire({
              title: 'Pengajuan Sukses!',
              text: 'Permintaan peminjaman berhasil masuk ke database backend bos.',
              icon: 'success',
              background: '#111827',
              color: '#FFF',
              confirmButtonColor: '#10B981'
            });
          })
          .catch((error) => {
            Swal.fire({
              title: 'Gagal Pengajuan!',
              text: error.response?.data?.message || 'Ada error saat input database bos.',
              icon: 'error',
              background: '#111827',
              color: '#FFF',
              confirmButtonColor: '#EF4444'
            });
          });
      }
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => (item.id || item._id) !== id));
  };

  const handleCheckout = () => {
    Swal.fire({
      title: 'Konfirmasi Pesanan',
      text: 'Lanjutkan checkout belanjaan premium Anda, bos?',
      icon: 'info',
      showCancelButton: true,
      background: '#111827',
      color: '#FFF',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Selesaikan Pembayaran'
    }).then((result) => {
      if (result.isConfirmed) {
        setCart([]);
        setIsCartOpen(false);
        Swal.fire({
          title: 'Transaksi Sukses!',
          text: 'Terima kasih telah berbelanja di Mbur Store.',
          icon: 'success',
          background: '#111827',
          color: '#FFF',
          confirmButtonColor: '#10B981'
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      <Navbar 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        currentTab={activeTab}
        setTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'products' ? (
          <Product onDetail={setSelectedProduct} onAddToCart={handleAddToCart} />
        ) : (
          <Loan />
        )}
      </main>

      {/* Modals & Popups */}
      <ProductDetailModal 
        isOpen={!!selectedProduct} 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={handleAddToCart}
        onAddToLoan={handleAddToLoan}
      />

      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <AuthModal />
    </div>
  );
}