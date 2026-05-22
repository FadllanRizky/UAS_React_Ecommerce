import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function CartModal({ isOpen, onClose, cartItems, onRemove, onCheckout }) {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111827] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-emerald-400" /> Keranjang Belanja
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <ShoppingBag size={48} className="stroke-1 text-slate-600" />
              <p className="text-sm">Keranjang Anda masih kosong bos.</p>
            </div>
          ) : (
            cartItems.map((item, index) => {
              // 🔥 SINKRONISASI DATA SUPABASE: Ambil dari image_url dan description
              const displayImage = item.image_url || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
              const displayName = item.description || item.name || 'Premium Product';
              const itemId = item.id || item._id;

              return (
                <div key={index} className="flex gap-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl items-center">
                  {/* Container gambar diubah ke object-contain agar pas dan tidak terpotong */}
                  <div className="w-16 h-16 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800">
                    <img 
                      src={displayImage} 
                      alt={displayName} 
                      className="max-w-full max-h-full object-contain rounded-md" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{displayName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.quantity} x Rp {Number(item.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => onRemove(itemId)} 
                    className="p-2 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-medium">Subtotal</span>
              <span className="text-lg font-black text-emerald-400">Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/20 text-center text-sm"
            >
              Checkout Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}