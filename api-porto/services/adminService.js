import { supabase } from '../config/db.js';

export const adminService = {
  // ==================== 👥 MANAGEMENT USERS ====================
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateUser(id, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update({
        balance: Number(updateData.balance || 0),
        loan_limit: Number(updateData.loan_limit || 0),
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'User berhasil dihapus dari pangkalan data!' };
  },

  // ==================== 💰 MANAGEMENT LOANS ====================
  async getAllLoans() {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        products (id, name, price, brand),
        users (id, email, username, balance)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async approveLoan(id, adminId) {
    const { data: loan, error: loanErr } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (loanErr || !loan) throw new Error('Berkas pinjaman tidak ditemukan!');
    if (loan.status === 'approved') throw new Error('Pinjaman ini sudah di-ACC sebelumnya!');

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('id', loan.user_id)
      .single();

    if (userErr || !user) throw new Error('User peminjam tidak ditemukan');

    const newBalance = Number(user.balance || 0) + Number(loan.loan_amount || 0);

    // Suntik saldo ke user
    const { error: updateWallErr } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', loan.user_id);

    if (updateWallErr) throw new Error('Gagal menyuntikkan dana saldo: ' + updateWallErr.message);

    // Update status berkas di tabel loans
    const { error: updateLoanErr } = await supabase
      .from('loans')
      .update({ 
        status: 'approved',
        approved_by: adminId,
        update_at: new Date()
      })
      .eq('id', id);

    if (updateLoanErr) throw new Error('Gagal memperbarui status berkas: ' + updateLoanErr.message);

    return { message: 'Pinjaman disetujui, dana sukses dicairkan bos!' };
  },

  async rejectLoan(id, adminId) {
    const { error } = await supabase
      .from('loans')
      .update({ 
        status: 'rejected',
        approved_by: adminId,
        update_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Berkas pinjaman berhasil ditolak!' };
  },

  // ==================== 📦 MANAGEMENT PRODUCTS ====================
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, update_at: new Date() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Produk berhasil ditendang dari etalase!' };
  },

  // ==================== 🏷️ MANAGEMENT CATEGORIES ====================
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateCategory(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Kategori berhasil dimusnahkan!' };
  }
};