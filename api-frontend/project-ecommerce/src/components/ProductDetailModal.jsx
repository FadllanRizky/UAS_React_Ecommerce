import React from 'react';
import { X, ShoppingCart, CalendarRange } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, onAddToLoan }) {
  if (!isOpen || !product) return null;

  const displayImage = product.image_url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  const displayName = product.description || product.name || 'Premium Product';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 transition-all">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* UKURAN GAMBAR MODAL DETAIL: h-80 memberikan ruang vertikal yang lebih besar untuk detail produk */}
        <div className="relative h-80 bg-[#0B0F19] flex items-center justify-center p-4">
          <img 
            src={displayImage} 
            alt={displayName} 
            className="max-w-full max-h-full object-contain opacity-95" 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
            }}
          />
          <button onClick={close} className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10">
            <X size={18} onClick={onClose} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent">
            <span className="text-xs uppercase tracking-widest font-extrabold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
              {product.brand || 'GENERIC'}
            </span>
            <h2 className="text-2xl font-black text-white mt-2 drop-shadow-md">{displayName}</h2>
          </div>
        </div>

        <div className="p-6 space-y-4 bg-[#111827]">
          <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs text-slate-500">Harga Jual</p>
              <p className="text-lg font-bold text-emerald-400">Rp {Number(product.price || 0).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Ketersediaan Stok</p>
              <p className="text-lg font-bold text-slate-200">{product.stok !== undefined ? product.stok : (product.stock || 0)} Unit tersedia</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Spesifikasi / Detail</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Produk original berkualitas tinggi dari brand {product.brand || 'terpercaya'}. Memiliki spesifikasi kelas atas yang siap mendukung produktivitas kerja maupun kebutuhan harian bos.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-3">
            <button 
              onClick={() => { onAddToCart(product); onClose(); }}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
            >
              <ShoppingCart size={16} /> Beli Sekarang
            </button>
            <button 
              onClick={() => { onAddToLoan(product); onClose(); }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <CalendarRange size={16} /> Ajukan Pinjaman
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}