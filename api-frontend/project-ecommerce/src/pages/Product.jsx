import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Product({ onDetail, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  useEffect(() => {
    getProducts()
      .then((response) => {
        // Antisipasi jika data dibungkus di dalam response.data.rows oleh pg pool postgresql
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Eksplorasi Produk Realtime</h1>
        <p className="text-xs text-slate-400 mt-1">Data langsung diambil dari database server lokal milikmu, bos.</p>
      </div> */}

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">Tidak ada produk ditemukan di database bos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProducts.map((product) => (
            <ProductCard 
              key={product.id || product._id} 
              product={product} 
              onDetail={onDetail} 
              onAddToCart={onAddToCart} 
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
    </div>
  );
}