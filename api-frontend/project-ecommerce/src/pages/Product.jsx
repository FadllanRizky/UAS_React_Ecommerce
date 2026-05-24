import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/productApi';
import { useAuth } from '../contexts/AuthContext'; 
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal'; 
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

// 🔥 Tangkap prop onAddToLoan dari App.jsx
export default function Product({ onAddToCart, onAddToLoan }) {
  const { token } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6; 

  useEffect(() => {
    getProducts()
      .then((response) => {
        let extractedProducts = [];
        if (Array.isArray(response.data)) {
          extractedProducts = response.data;
        } else if (response.data && Array.isArray(response.data.rows)) {
          extractedProducts = response.data.rows;
        } else if (response.data && typeof response.data === 'object') {
          extractedProducts = response.data.products || Object.values(response.data).find(Array.isArray) || [];
        }
        
        setProducts(extractedProducts);
      })
      .catch((err) => console.error("Gagal load database produk:", err));
  }, []);

  // 🔥 TRIGGER OPER DATA & PINDAH TAB KE APP.JSX
  const handleAddToLoan = (product) => {
    if (!token) {
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Bos harus login terlebih dahulu untuk mengajukan pinjaman!',
        icon: 'warning',
        background: '#111827',
        color: '#FFF',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    // Tutup modal detail terlebih dahulu jika sedang terbuka
    setIsModalOpen(false);

    // 🔥 Panggil fungsi operan dari App.jsx untuk pindah halaman & kirim data produk
    if (onAddToLoan) {
      onAddToLoan(product);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {products.length === 0 ? (
        <p className="text-sm text-slate-500">Tidak ada produk ditemukan di database bos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProducts.map((product) => (
            <ProductCard 
              key={product.id || product._id} 
              product={product} 
              onDetail={(p) => {
                setSelectedProduct(p);
                setIsModalOpen(true);
              }} 
              onAddToCart={onAddToCart} 
              onAddToLoan={handleAddToLoan} // 🔥 Berjalan lancar bos!
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {products.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 font-bold text-xs rounded-lg border transition-all ${currentPage === i + 1 ? 'bg-emerald-500 border-transparent text-white shadow-lg shadow-emerald-950/30' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL DETAIL PRODUK */}
      <ProductDetailModal 
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={onAddToCart}
        onAddToLoan={handleAddToLoan} 
      />
    </div>
  );
}