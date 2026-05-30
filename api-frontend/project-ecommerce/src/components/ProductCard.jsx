import React from 'react';
import { Eye, ShoppingBag, Heart, MessageSquare } from 'lucide-react';

export default function ProductCard({ product, onDetail, onAddToCart, isFavorite, onToggleFavorite }) {
  // Ambil data fleksibel mengantisipasi perbedaan nama field database bos
  const displayImage = product.image_url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  const displayName = product.name || product.nama || product.description || 'Premium Product';
  const displayBrand = product.brand || product.merk || 'GENERIC';
  const displayPrice = product.price || product.harga || 0;
  const displayStock = product.stok !== undefined ? product.stok : (product.stock !== undefined ? product.stock : 0);

  const triggerChatWidget = (e) => {
    e.stopPropagation(); // Biar card detail gak ikutan kebuka
    // Menembak selektor tombol chat bawaan widget di dalam kontainer tersembunyi
    const chatBtn = document.querySelector('#mbur-chat-wrapper button') || document.querySelector('.live-chat-widget button');
    if (chatBtn) {
      chatBtn.click();
    } else {
      alert("Widget chat admin belum siap atau belum termuat bos!");
    }
  };

  return (
    <div className="group bg-[#111827] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-emerald-950/10 relative">
      
      {/* Tombol Favorit */}
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleFavorite(product.id); 
        }} 
        className="absolute top-3 left-3 z-10 p-2 rounded-xl bg-slate-950/80 border border-slate-800/60 backdrop-blur-sm transition-all text-slate-400 hover:text-rose-500"
      >
        <Heart size={15} fill={isFavorite ? '#F43F5E' : 'transparent'} className={isFavorite ? 'text-rose-500' : 'text-slate-400'} />
      </button>

      <div className="relative overflow-hidden aspect-square bg-[#0B0F19]">
        <img 
          src={displayImage} 
          alt={displayName} 
          className="w-full h-full object-contain p-4 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'; }}
        />
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 bg-slate-900/90 text-emerald-400 rounded-md border border-slate-800/80 shadow-md">
          {displayBrand}
        </span>
      </div>

      <div className="p-5 bg-[#111827]">
        <h3 className="text-base font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
          {displayName}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Stok: <span className="text-slate-300 font-medium">{displayStock} pcs</span>
        </p>
        
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-base font-black text-emerald-400">
            Rp {Number(displayPrice).toLocaleString('id-ID')}
          </span>
          <div className="flex gap-2">
            <button onClick={triggerChatWidget} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors" title="Hubungi Admin">
              <MessageSquare size={16} />
            </button>
            <button onClick={() => onDetail(product)} className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" title="Detail Produk">
              <Eye size={16} />
            </button>
            <button onClick={() => onAddToCart(product, 1)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-transparent rounded-lg transition-all" title="Tambah ke Keranjang">
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}