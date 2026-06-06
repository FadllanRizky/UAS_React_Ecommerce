import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, ShoppingBag, DollarSign, MessageSquare, Tag, Edit, Trash2, Check, X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axiosInstance'; // Instance axios auto-token
import { adminService } from '../api/adminApi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [currentSubTab, setCurrentSubTab] = useState('chat');
  
  // State Data Utama
  const [allUsers, setAllUsers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  // Fungsi Sinkronisasi Data Master Berkala (Dibuat super defensif & informatif)
  const loadAdminData = async () => {
    try {
      const [resUsers, resProducts, resLoans, resCategories, resChatUsers] = await Promise.all([
        adminService.getUsers().catch((err) => { console.error("🚨 API Error (Users):", err); return { data: [] }; }),
        adminService.getProducts().catch((err) => { console.error("🚨 API Error (Products):", err); return { data: [] }; }), 
        adminService.getLoans().catch((err) => { console.error("🚨 API Error (Loans):", err); return { data: [] }; }),
        adminService.getCategories().catch((err) => { console.error("🚨 API Error (Categories):", err); return { data: [] }; }),
        api.get('/chat/admin/users').catch((err) => { console.error("🚨 API Error (Chat):", err); return { data: [] }; })
      ]);

      // 🔥 AUTO-EXTRACTOR: Antisipasi jika data dibungkus res.data.data atau res.data.loans
      const rawUsers = resUsers?.data?.data || resUsers?.data?.users || resUsers?.data || [];
      const rawProducts = resProducts?.data?.data || resProducts?.data?.products || resProducts?.data || [];
      const rawLoans = resLoans?.data?.data || resLoans?.data?.loans || resLoans?.data || [];
      const rawCategories = resCategories?.data?.data || resCategories?.data?.categories || resCategories?.data || [];
      const rawChatUsers = resChatUsers?.data?.data || resChatUsers?.data || [];

      // Set State hanya jika data valid berbentuk Array
      setAllUsers(Array.isArray(rawUsers) ? rawUsers : []);
      setAllProducts(Array.isArray(rawProducts) ? rawProducts : []);
      setAllLoans(Array.isArray(rawLoans) ? rawLoans : []);
      setAllCategories(Array.isArray(rawCategories) ? rawCategories : []);
      setChatUsers(Array.isArray(rawChatUsers) ? rawChatUsers : []);

    } catch (err) {
      console.error("Gagal sinkronisasi pangkalan data admin:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 4000); // Auto refresh data tiap 4 detik
    return () => clearInterval(interval);
  }, []);

  // ==================== 👥 HANDLER CRUD USERS ====================
  const handleEditUser = (u) => {
    Swal.fire({
      title: `Ubah Parameter: ${u.full_name || u.email}`,
      html: `
        <div class="flex flex-col gap-2 text-left font-sans">
          <label class="text-xs text-slate-400">Saldo Dompet (Rp)</label>
          <input id="swal-balance" type="number" class="swal2-input !m-0 !w-full bg-slate-900 text-white border-slate-700" value="${u.balance || 0}">
          <label class="text-xs text-slate-400 mt-2">Limit Maksimal Pinjaman (Rp)</label>
          <input id="swal-limit" type="number" class="swal2-input !m-0 !w-full bg-slate-900 text-white border-slate-700" value="${u.loan_limit || 0}">
        </div>
      `,
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#06b6d4',
      showCancelButton: true,
      preConfirm: () => ({
        balance: document.getElementById('swal-balance').value,
        loan_limit: document.getElementById('swal-limit').value
      })
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.updateUser(u.id, result.value);
          Swal.fire({ title: 'Berhasil!', text: 'Profil keuangan user diperbarui.', icon: 'success', background: '#111827', color: '#fff' });
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Terjadi gangguan sistem.', 'error'); }
      }
    });
  };

  const handleDeleteUser = (id) => {
    Swal.fire({
      title: 'Depak User?',
      text: "User akan ditiadakan permanen dari pangkalan data!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      background: '#111827',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.deleteUser(id);
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Gagal menghapus user.', 'error'); }
      }
    });
  };

  // ==================== 📦 HANDLER CRUD PRODUCTS ====================
  const handleAddProduct = () => {
    Swal.fire({
      title: 'Tambah Produk Baru',
      html: `
        <input id="p-name" class="swal2-input bg-slate-900 text-white" placeholder="Nama Produk">
        <input id="p-price" type="number" class="swal2-input bg-slate-900 text-white" placeholder="Harga Kredit (Rp)">
        <input id="p-stok" type="number" class="swal2-input bg-slate-900 text-white" placeholder="Jumlah Stok">
        <input id="p-img" class="swal2-input bg-slate-900 text-white" placeholder="URL Link Gambar">
      `,
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#10b981',
      preConfirm: () => ({
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        stok: document.getElementById('p-stok').value,
        image_url: document.getElementById('p-img').value
      })
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.createProduct(result.value);
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Isian data tidak valid', 'error'); }
      }
    });
  };

  const handleEditProduct = (p) => {
    Swal.fire({
      title: 'Ubah Data Produk',
      html: `
        <input id="p-name" class="swal2-input bg-slate-900 text-white" value="${p.name}">
        <input id="p-price" type="number" class="swal2-input bg-slate-900 text-white" value="${p.price}">
        <input id="p-stok" type="number" class="swal2-input bg-slate-900 text-white" value="${p.stok || p.stock || 0}">
        <input id="p-img" class="swal2-input bg-slate-900 text-white" value="${p.image_url || ''}">
      `,
      background: '#111827',
      color: '#fff',
      preConfirm: () => ({
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        stok: document.getElementById('p-stok').value,
        image_url: document.getElementById('p-img').value
      })
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.updateProduct(p.id, result.value);
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Update error.', 'error'); }
      }
    });
  };

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: 'Hapus Produk?',
      text: "Produk akan ditarik dari peredaran toko!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      background: '#111827',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.deleteProduct(id);
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Gagal menghapus produk.', 'error'); }
      }
    });
  };

  // ==================== 🏷️ HANDLER CRUD CATEGORIES ====================
  const handleAddCategory = () => {
    Swal.fire({
      title: 'Tambah Kategori Baru',
      html: `
        <input id="c-name" class="swal2-input bg-slate-900 text-white" placeholder="Nama Kategori">
        <input id="c-slug" class="swal2-input bg-slate-900 text-white" placeholder="Slug (Contoh: gadget-elektronik)">
      `,
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#10b981',
      preConfirm: () => ({
        name: document.getElementById('c-name').value,
        slug: document.getElementById('c-slug').value
      })
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.createCategory(result.value);
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Gagal membuat kategori baru.', 'error'); }
      }
    });
  };

  const handleEditCategory = (c) => {
    Swal.fire({
      title: 'Ubah Data Kategori',
      html: `
        <input id="c-name" class="swal2-input bg-slate-900 text-white" value="${c.name}">
        <input id="c-slug" class="swal2-input bg-slate-900 text-white" value="${c.slug}">
      `,
      background: '#111827',
      color: '#fff',
      preConfirm: () => ({
        name: document.getElementById('c-name').value,
        slug: document.getElementById('c-slug').value
      })
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.updateCategory(c.id, result.value);
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Gagal update data kategori.', 'error'); }
      }
    });
  };

  const handleDeleteCategory = (id) => {
    Swal.fire({
      title: 'Babat Kategori?',
      text: "Seluruh relasi kategori ini akan terputus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      background: '#111827',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.deleteCategory(id);
          loadAdminData();
        } catch { Swal.fire('Gagal!', 'Gagal menghapus kategori.', 'error'); }
      }
    });
  };

  // ==================== 💰 HANDLER APPROVAL LOANS ====================
  const handleProcessLoan = async (id, status) => {
    try {
      const res = status === 'approved' 
        ? await adminService.approveLoan(id) 
        : await adminService.rejectLoan(id);
      
      Swal.fire({ title: 'Berhasil!', text: res.data.message, icon: 'success', background: '#111827', color: '#fff' });
      loadAdminData();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.error || 'Aksi ditolak sistem.', 'error');
    }
  };

  const openChatWithUser = (userId) => {
    setSelectedChatUser(userId);
    window.dispatchEvent(new CustomEvent('trigger-mbur-chat', { detail: { targetUser: userId } }));
  };

  return (
    <div className="flex gap-6 min-h-[80vh] font-sans antialiased text-slate-300">
      
      {/* 🚀 LEFT SIDE NAVIGATION BAR */}
      <div className="w-64 bg-[#111827] border border-slate-800 rounded-2xl p-4 space-y-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl mb-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Shield size={18} /></div>
            <div>
              <h2 className="text-xs font-black tracking-wider text-white uppercase">MODE KONTROL</h2>
              <p className="text-[10px] text-slate-400 font-medium">@{user?.username || 'Administrator'}</p>
            </div>
          </div>

          <button onClick={() => setCurrentSubTab('chat')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentSubTab === 'chat' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
            <span className="flex items-center gap-2"><MessageSquare size={16} /> Hub Chat Masuk</span>
            {chatUsers.length > 0 && <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-black animate-pulse">{chatUsers.length}</span>}
          </button>

          <button onClick={() => setCurrentSubTab('users')} className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentSubTab === 'users' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
            <span className="flex items-center gap-2"><Users size={16} /> Manajemen Users</span>
          </button>

          <button onClick={() => setCurrentSubTab('products')} className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentSubTab === 'products' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
            <span className="flex items-center gap-2"><ShoppingBag size={16} /> Manajemen Produk</span>
          </button>

          <button onClick={() => setCurrentSubTab('categories')} className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentSubTab === 'categories' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
            <span className="flex items-center gap-2"><Tag size={16} /> Manajemen Kategori</span>
          </button>

          <button onClick={() => setCurrentSubTab('loans')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentSubTab === 'loans' ? 'bg-cyan-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
            <span className="flex items-center gap-2"><DollarSign size={16} /> Approval Kredit</span>
            {allLoans.filter(l => l?.status === 'pending').length > 0 && (
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md text-[9px] font-black">
                {allLoans.filter(l => l?.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 🖥️ RIGHT CONTENT BOARD */}
      <div className="flex-1 bg-[#111827]/30 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
        
        {/* CHAT TAB */}
        {currentSubTab === 'chat' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-black text-white uppercase">HUB CHAT CUSTOMER MASUK</h2>
              <p className="text-xs text-slate-400">Notifikasi interaksi pertanyaan spesifikasi produk atau pengajuan nego dari customer.</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {chatUsers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">Belum ada pesan baru masuk.</div>
              ) : (
                chatUsers.map(cu => (
                  <div key={cu.id} className={`p-4 border rounded-xl flex justify-between items-center bg-slate-900/60 transition-all ${selectedChatUser === cu.id ? 'border-cyan-500' : 'border-slate-800 hover:border-slate-700'}`}>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{cu.username || cu.full_name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cu.email}</p>
                    </div>
                    <button onClick={() => openChatWithUser(cu.id)} className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-extrabold rounded-lg flex items-center gap-1.5 transition-colors">
                      <MessageSquare size={12} /> BALAS CHAT
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {currentSubTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Kelola Akun Nasabah</h2>
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Nama User</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Hak Akses</th>
                    <th className="p-3.5">Saldo</th>
                    <th className="p-3.5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/20">
                      <td className="p-3.5 font-bold text-white">{u.full_name || u.username || 'No Name'}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{u.email}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-emerald-400 font-black">Rp {Number(u.balance || 0).toLocaleString('id-ID')}</td>
                      <td className="p-3.5 flex justify-center gap-1">
                        <button onClick={() => handleEditUser(u)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"><Edit size={13} /></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {currentSubTab === 'products' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase">Etalase Inventori Barang</h2>
              <button onClick={handleAddProduct} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all">
                <Plus size={14} /> TAMBAH PRODUK
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Nama Produk</th>
                    <th className="p-3.5">Harga</th>
                    <th className="p-3.5">Stok Sisa</th>
                    <th className="p-3.5 text-center">Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {allProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-900/20">
                      <td className="p-3.5 font-bold text-white flex items-center gap-3">
                        {p.image_url && <img src={p.image_url} alt="" className="w-7 h-7 object-cover rounded-lg bg-slate-800" />}
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-bold">Rp {Number(p.price || 0).toLocaleString('id-ID')}</td>
                      <td className="p-3.5 font-mono text-slate-400">{p.stok || p.stock || 0} unit</td>
                      <td className="p-3.5 flex justify-center gap-1">
                        <button onClick={() => handleEditProduct(p)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"><Edit size={13} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {currentSubTab === 'categories' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase">Kategori Klasifikasi Komoditas</h2>
              <button onClick={handleAddCategory} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all">
                <Plus size={14} /> TAMBAH KATEGORI
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Nama Kategori</th>
                    <th className="p-3.5">Slug Parameter</th>
                    <th className="p-3.5 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {allCategories.length === 0 ? (
                    <tr><td colSpan="3" className="p-4 text-center text-slate-500">Belum ada kategori yang dikonfigurasi atau API bermasalah.</td></tr>
                  ) : (
                    allCategories.map(c => (
                      <tr key={c.id || c.slug} className="hover:bg-slate-900/20">
                        <td className="p-3.5 font-bold text-white uppercase tracking-tight">{c.name}</td>
                        <td className="p-3.5 text-slate-400 font-mono">{c.slug}</td>
                        <td className="p-3.5 flex justify-center gap-1">
                          <button onClick={() => handleEditCategory(c)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"><Edit size={13} /></button>
                          <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOANS TAB */}
        {currentSubTab === 'loans' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-black text-white uppercase">ACC Lembar Komitmen Dana Kredit</h2>
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-3.5">Peminjam</th>
                    <th className="p-3.5">No Telepon / NIK</th>
                    <th className="p-3.5">Jumlah Dana</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {allLoans.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-slate-500">Belum ada riwayat berkas pinjaman atau API bermasalah.</td></tr>
                  ) : (
                    allLoans.map(l => (
                      <tr key={l.id} className="hover:bg-slate-900/20">
                        <td className="p-3.5 font-bold text-white">
                          <div className="font-bold">{l.full_name_applicant || l.users?.username || l.username || 'User Terhapus'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{l.users?.email || l.email || ''}</div>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">
                          <div>Telp: {l.phone_number || '-'}</div>
                          <div className="text-[10px] text-slate-500">NIK: {l.nik || '-'}</div>
                        </td>
                        <td className="p-3.5 font-black text-cyan-400">Rp {Number(l.loan_amount || l.amount || 0).toLocaleString('id-ID')}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            l.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                            l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>{l.status}</span>
                        </td>
                        <td className="p-3.5 text-right">
                          {l.status === 'pending' ? (
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => handleProcessLoan(l.id, 'approved')} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg flex items-center gap-0.5 transition-colors">
                                <Check size={11} /> ACC
                              </button>
                              <button onClick={() => handleProcessLoan(l.id, 'rejected')} className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black rounded-lg flex items-center gap-0.5 transition-colors">
                                <X size={11} /> REJECT
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">Selesai Diproses</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}