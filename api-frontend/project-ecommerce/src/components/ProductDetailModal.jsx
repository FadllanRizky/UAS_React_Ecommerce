import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, CalendarRange, Plus, Minus } from 'lucide-react';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, onAddToLoan }) {
  const [quantity, setQuantity] = useState(1);

  // Reset kuantitas ke 1 setiap kali modal produk baru dibuka bos
  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Mengamankan pemetaan data properti (Mencegah teks hilang karena perbedaan nama field di database)
  const displayImage = product.image_url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  const displayName = product.name || product.nama || product.description || 'Premium Product';
  const displayBrand = product.brand || product.merk || 'GENERIC';
  const displayPrice = product.price || product.harga || 0;
  const maxStock = product.stok !== undefined ? product.stok : (product.stock || 0);
  const displayDesc = product.description || `Produk original berkualitas tinggi dari brand ${displayBrand}. Memiliki spesifikasi kelas atas yang siap mendukung produktivitas kerja maupun kebutuhan harian bos.`;

  const handleQtyChange = (val) => {
    if (val <= 0) return;
    if (val > maxStock) return;
    setQuantity(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 transition-all">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="relative h-80 bg-[#0B0F19] flex items-center justify-center p-4">
          <img src={displayImage} alt={displayName} className="max-w-full max-h-full object-contain opacity-95" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors z-10">
            <X size={18} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent">
            <span className="text-xs uppercase tracking-widest font-extrabold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
              {displayBrand}
            </span>
            <h2 className="text-2xl font-black text-white mt-2 drop-shadow-md">{displayName}</h2>
          </div>
        </div>

        <div className="p-6 space-y-4 bg-[#111827]">
          <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
            <div>
              <p className="text-xs text-slate-500">Harga Satuan</p>
              <p className="text-lg font-bold text-emerald-400">Rp {Number(displayPrice).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Ketersediaan Stok</p>
              <p className="text-lg font-bold text-slate-200">{maxStock} Unit tersedia</p>
            </div>
          </div>

          {/* Pengatur Kuantitas Pembelian */}
          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900 rounded-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atur Kuantitas Beli</span>
            <div className="flex items-center gap-3">
              <button onClick={() => handleQtyChange(quantity - 1)} className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-400">
                <Minus size={14} />
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => handleQtyChange(parseInt(e.target.value) || 1)}
                className="w-14 bg-slate-900 text-center font-mono font-bold text-white text-sm focus:outline-none border border-slate-800 py-1 rounded-md"
              />
              <button onClick={() => handleQtyChange(quantity + 1)} className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-400">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Spesifikasi / Detail</h4>
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
              {displayDesc}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-3">
            <button 
              onClick={() => { onAddToCart(product, quantity); onClose(); }}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
            >
              <ShoppingCart size={16} /> Masukkan Keranjang ({quantity}x)
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