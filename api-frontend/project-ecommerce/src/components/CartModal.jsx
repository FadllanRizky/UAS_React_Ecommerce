import React from 'react';
import { X, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

export default function CartModal({ isOpen, onClose, cart, setCart, onCheckout }) {
  if (!isOpen) return null;

  const updateQuantity = (id, amount) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = (item.quantity || 1) + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#111827] border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Keranjang Bos</h2>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
              {cart.length} Item
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <p className="text-sm">Keranjang bos masih kosong melompong.</p>
            </div>
          ) : (
            cart.map((item) => {
              const qty = item.quantity || 1;
              return (
                <div key={item.id} className="flex gap-4 p-3 bg-slate-950 border border-slate-900 rounded-xl relative group">
                  <div className="w-16 h-16 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                    <img 
                      src={item.image_url || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'} 
                      alt={item.name} 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 truncate pr-6">{item.description || item.name}</h4>
                    <p className="text-xs text-emerald-400 font-bold mt-0.5">Rp {Number(item.price * qty).toLocaleString('id-ID')}</p>
                    
                    {/* Counter Quantity */}
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-800 text-slate-400 hover:text-white transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-300 px-1 w-6 text-center">{qty}</span>
                      <button 
                        onClick={() => {
                          const maxStock = item.stok !== undefined ? item.stok : (item.stock || 0);
                          if(qty >= maxStock) return;
                          updateQuantity(item.id, 1);
                        }} 
                        className="p-1 bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pembayaran</span>
            <span className="text-lg font-black text-emerald-400 font-mono">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => { onCheckout(totalPrice); onClose(); }}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
          >
            <CreditCard size={16} /> BAYAR SEKARANG VIA SALDO
          </button>
        </div>

      </div>
    </div>
  );
}