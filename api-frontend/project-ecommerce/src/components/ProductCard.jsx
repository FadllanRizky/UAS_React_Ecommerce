import React from 'react';
import { Eye, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, onDetail, onAddToCart }) {
  const displayImage = product.image_url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  const displayName = product.description || product.name || 'Premium Product';

  return (
    <div className="group bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-emerald-950/10">
      {/* UKURAN GAMBAR DIBESARKAN: Menggunakan aspect-square (1:1) agar produk terlihat penuh dan jelas */}
      <div className="relative overflow-hidden aspect-square bg-[#0B0F19]">
        <img 
          src={displayImage} 
          alt={displayName} 
          className="w-full h-full object-contain p-4 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 bg-slate-900/90 text-emerald-400 rounded-md border border-slate-800/80 shadow-md">
          {product.brand || 'GENERIC'}
        </span>
      </div>

      <div className="p-5 bg-[#111827]">
        <h3 className="text-base font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
          {displayName}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Stok: <span className="text-slate-300 font-medium">{product.stok !== undefined ? product.stok : (product.stock || 0)} pcs</span>
        </p>
        
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-base font-black text-emerald-400">
            Rp {Number(product.price || 0).toLocaleString('id-ID')}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => onDetail(product)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Detail Produk"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => onAddToCart(product)}
              className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-transparent rounded-lg transition-all"
              title="Tambah ke Keranjang"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}