import React, { useState, useEffect } from 'react';
import { getMyLoans, createLoan } from '../api/loanApi';
import { getProducts } from '../api/productApi';
import { useAuth } from '../contexts/AuthContext';
import { 
  Banknote, 
  Package, 
  CalendarRange, 
  ShieldCheck, 
  Coins, 
  FileText, 
  ArrowUpRight, 
  HelpCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Loan() {
  const { token } = useAuth();

  const [loans, setLoans] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form input untuk pinjaman cash dinamis biar makin mantap, bos
  const [cashAmount, setCashAmount] = useState(1000000);
  const [tenureMonth, setTenureMonth] = useState(6);

  const loadLoans = async () => {
    try {
      const res = await getMyLoans(token);
      // Antisipasi data langsung array atau di dalam response.data.rows
      let extractedLoans = [];
      if (Array.isArray(res.data)) {
        extractedLoans = res.data;
      } else if (res.data && Array.isArray(res.data.rows)) {
        extractedLoans = res.data.rows;
      }
      setLoans(extractedLoans);
    } catch (err) {
      console.error("Gagal memuat log pinjaman:", err);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadLoans();

    getProducts().then(res => {
      let extractedProducts = [];
      if (Array.isArray(res.data)) {
        extractedProducts = res.data;
      } else if (res.data && Array.isArray(res.data.rows)) {
        extractedProducts = res.data.rows;
      }
      setProducts(extractedProducts);
    });
  }, [token]);

  // 🔥 PINJAM CASH
  const handleCash = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Ajukan Pinjaman Cash?',
      text: `Apakah bos yakin ingin mengajukan pinjaman dana sebesar Rp ${Number(cashAmount).toLocaleString('id-ID')}?`,
      icon: 'question',
      showCancelButton: true,
      background: '#111827',
      color: '#E2E8F0',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Ya, Ajukan Dana!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const monthlyPayment = Math.round((cashAmount / tenureMonth) + (cashAmount * 0.05));
          
          await createLoan({
            loan_amount: Number(cashAmount),
            tenure_month: Number(tenureMonth),
            interest_rate: 5,
            monthly_payment: monthlyPayment,
            type: 'cash',
            reason: 'Modal usaha bos'
          }, token);

          Swal.fire({
            title: 'Pengajuan Sukses!',
            text: 'Pinjaman cash berhasil masuk ke database server, bos!',
            icon: 'success',
            background: '#111827',
            color: '#FFF',
            confirmButtonColor: '#10B981'
          });
          
          loadLoans();
        } catch (error) {
          Swal.fire({
            title: 'Gagal Mengajukan!',
            text: error.response?.data?.message || 'Gagal menyimpan data ke backend.',
            icon: 'error',
            background: '#111827',
            color: '#FFF',
            confirmButtonColor: '#EF4444'
          });
        }
      }
    });
  };

  // 🔥 PINJAM PRODUK
  const handleProduct = async () => {
    if (!selectedProduct) {
      Swal.fire({
        title: 'Pilih Produk!',
        text: 'Silakan pilih salah satu gadget premium terlebih dahulu, bos.',
        icon: 'warning',
        background: '#111827',
        color: '#FFF',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    const displayName = selectedProduct.description || selectedProduct.name || 'Premium Product';

    Swal.fire({
      title: 'Pinjam Gadget Premium?',
      text: `Ajukan peminjaman aset unit ${displayName}?`,
      icon: 'question',
      showCancelButton: true,
      background: '#111827',
      color: '#E2E8F0',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Ya, Pinjam Barang!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const productId = selectedProduct.id || selectedProduct._id;
          
          await createLoan({
            product_id: productId,
            tenure_month: 6,
            interest_rate: 5,
            monthly_payment: Math.round((selectedProduct.price || 0) / 6),
            type: 'product'
          }, token);

          Swal.fire({
            title: 'Barang Diajukan!',
            text: 'Pengajuan aset produk berhasil tersimpan di database.',
            icon: 'success',
            background: '#111827',
            color: '#FFF',
            confirmButtonColor: '#10B981'
          });

          setSelectedProduct(null);
          loadLoans();
        } catch (error) {
          Swal.fire({
            title: 'Error Database!',
            text: error.response?.data?.message || 'Ada kendala input data.',
            icon: 'error',
            background: '#111827',
            color: '#FFF',
            confirmButtonColor: '#EF4444'
          });
        }
      }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarRange className="text-emerald-400" size={26} /> PANEL TRANSAKSI & PINJAMAN
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ajukan permodalan cash usaha atau pinjam inventaris gadget premium langsung ke database, bos.
          </p>
        </div>
        <div className="flex gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-mono">
            Token Verified
          </span>
        </div>
      </div>

      {/* ACTION FORMS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORM OPSI 1: PINJAM DANA / CASH */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Banknote size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">Fasilitas Pinjaman Uang</h3>
                <p className="text-[11px] text-slate-400">Bunga flat ringan 5% untuk modal ekspansi bisnismu.</p>
              </div>
            </div>

            <form onSubmit={handleCash} className="space-y-4 mt-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Jumlah Dana (IDR)</label>
                <div className="relative">
                  <Coins size={16} className="absolute left-3 top-3.5 text-slate-500" />
                  <input 
                    type="number" 
                    value={cashAmount} 
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Masukkan jumlah dana"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Tenor Pembayaran</label>
                <select 
                  value={tenureMonth} 
                  onChange={(e) => setTenureMonth(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={12}>12 Bulan</option>
                </select>
              </div>
            </form>
          </div>

          <button 
            onClick={handleCash}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
          >
            Cairkan Dana Sekarang <ArrowUpRight size={16} />
          </button>
        </div>

        {/* FORM OPSI 2: PINJAM PRODUK / GADGET */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Package size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">Pinjam Inventaris Barang</h3>
                <p className="text-[11px] text-slate-400">Pilih unit gadget mewah yang tersedia langsung di database.</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1.5">Pilih Aset Gadget</label>
                <select 
                  onChange={(e) => {
                    const productId = e.target.value;
                    const product = products.find(p => (p.id || p._id) === productId);
                    setSelectedProduct(product);
                  }}
                  value={selectedProduct ? (selectedProduct.id || selectedProduct._id) : ""}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">-- Silakan Pilih Gadget --</option>
                  {products.map(p => {
                    const name = p.description || p.name || 'Premium Item';
                    return (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {name} - Rp {Number(p.price || 0).toLocaleString('id-ID')}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 animate-in fade-in duration-300">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Estimasi Angsuran</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tenor standard:</span>
                    <span className="text-white font-semibold">6 Bulan</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Cicilan / Bulan:</span>
                    <span className="text-cyan-400 font-bold">Rp {Math.round((selectedProduct.price || 0) / 6).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleProduct}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-950/20 flex items-center justify-center gap-2"
          >
            <Package size={16} /> Ajukan Pinjam Barang
          </button>
        </div>

      </div>

      {/* DATA LOG LOAN TABLE / VIEW */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="text-slate-400" size={18} />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Histori Aktivitas Pinjaman Bos</h3>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loans.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
              <HelpCircle size={32} className="text-slate-600 stroke-1" />
              <span>Belum ada log data pengajuan kredit di database kamu bos.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="p-4">ID Kontrak</th>
                    <th className="p-4">Jenis Kredit</th>
                    <th className="p-4">Deskripsi Aset / Dana</th>
                    <th className="p-4">Tenor</th>
                    <th className="p-4 text-right">Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                  {loans.map((l) => {
                    const isCash = l.type === 'cash';
                    return (
                      <tr key={l.id || l._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 font-mono text-xs text-slate-500">
                          #{String(l.id || l._id).slice(-6).toUpperCase()}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${isCash ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                            {isCash ? 'Cash Loan' : 'Product Loan'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white">
                          {isCash ? (
                            <span className="text-emerald-400">Rp {Number(l.loan_amount || 0).toLocaleString('id-ID')}</span>
                          ) : (
                            <span>{l.products?.description || l.products?.name || l.product?.name || 'Aset Gadget Premium'}</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 font-medium">
                          {l.tenure_month || 6} Bulan
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full border ${l.status === 'Approved' || l.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            <ShieldCheck size={12} /> {l.status || 'Pending Review'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}