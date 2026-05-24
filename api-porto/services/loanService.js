import { supabase } from '../config/db.js';

export const loanService = {

  async create(body, user) {
    if (!user?.id) throw new Error('User tidak valid bos');

    // Menghitung cicilan otomatis jika tipenya produk dan payload belum menghitungnya
    let finalAmount = body.loan_amount;
    let finalPayment = body.monthly_payment;

    if (body.type === 'product' && body.product_price) {
      finalAmount = body.product_price;
      finalPayment = Math.round(body.product_price / (body.tenure_month || 6));
    }

    const payload = {
      user_id: user.id,
      product_id: body.type === 'product' ? body.product_id : null,
      loan_amount: finalAmount,
      tenure_month: body.tenure_month ? parseInt(body.tenure_month) : 6,
      interest_rate: body.interest_rate || 5,
      monthly_payment: finalPayment,
      type: body.type || 'cash',
      status: 'pending', // Wajib lowercase sesuai constraint check di database bos
      reason: body.reason || null,
      id_card_url: body.id_card_url || null,
      
      // 🔥 Kolom baru data diri & gateway pembayaran sesuai request
      full_name_applicant: body.full_name_applicant || null,
      nik: body.nik || null,
      phone_number: body.phone_number || null,
      payment_method: body.payment_method || 'DANA'
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([payload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getByUser(user) {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        products (
          id,
          description,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  // 🔥 FITUR BARU: Ambil semua data pinjaman masuk (Khusus Admin)
  async getAllLoansForAdmin() {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        products (
          id,
          description,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  // 🔥 FITUR BARU: Update Status Persetujuan Admin (Approve/Reject)
  async updateStatusByAdmin(loanId, status, adminId) {
    const safeStatus = status.toLowerCase(); // Dipaksa lowercase agar lolos check constraint database bos
    
    if (!['approved', 'rejected', 'pending'].includes(safeStatus)) {
      throw new Error('Status tidak valid! Harus pending, approved, atau rejected');
    }

    const { data, error } = await supabase
      .from('loans')
      .update({ 
        status: safeStatus,
        approved_by: adminId
      })
      .eq('id', loanId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};