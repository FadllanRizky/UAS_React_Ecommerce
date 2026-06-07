import { supabase } from '../config/db.js';

export const loanService = {

  // 1. AJUKAN PINJAMAN BARU (Mendukung Penerusan Token RLS)
  async create(body, user, token) {
    // 1. Validasi apakah user sudah login melalui middleware
    if (!user?.id) throw new Error('User tidak valid, silakan login ulang bos!');

    // 2. Validasi wajib upload KTP
    if (!body.id_card_url || body.id_card_url.trim() === '') {
      throw new Error('Wajib mengupload foto KTP terlebih dahulu, bos!');
    }

    // 3. Validasi Nama Lengkap Pemohon
    if (!body.full_name_applicant || !body.full_name_applicant.trim()) {
      throw new Error('Nama lengkap pemohon wajib diisi sesuai KTP!');
    }

    // 4. Validasi NIK KTP (Wajib pas 16 digit angka)
    const cleanNik = body.nik ? body.nik.trim() : '';
    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      throw new Error('Nomor KTP (NIK) tidak valid! Harus berupa angka dan tepat 16 digit, bos!');
    }

    // 5. Validasi Nomor Telepon
    const cleanPhone = body.phone_number ? body.phone_number.trim() : '';
    if (cleanPhone.length < 10 || /^0+$/.test(cleanPhone) || !/^\d+$/.test(cleanPhone)) {
      throw new Error('Nomor telepon tidak valid! Tidak boleh angka 0 semua dan minimal 10 digit, bos!');
    }

    // Hitung nominal pinjaman awal
    let finalAmount = body.loan_amount;
    let finalPayment = body.monthly_payment;

    if (body.type === 'product' && body.product_price) {
      finalAmount = body.product_price;
      finalPayment = Math.round(body.product_price / (body.tenure_month || 6));
    }

    // 6. Validasi Nominal Pinjaman (Minimal 200 Ribu, Maksimal 5 Juta)
    const amountCheck = Number(finalAmount || 0);
    if (amountCheck < 200000) {
      throw new Error('Pengajuan ditolak! Minimal peminjaman uang adalah Rp 200.000, bos!');
    }
    if (amountCheck > 5000000) {
      throw new Error('Pengajuan ditolak! Maksimal limit peminjaman uang adalah Rp 5.000.000, bos!');
    }

    // Jika lolos semua validasi, bungkus data ke payload
    const payload = {
      user_id: user.id, 
      product_id: body.type === 'product' ? body.product_id : null,
      loan_amount: amountCheck,
      tenure_month: body.tenure_month ? parseInt(body.tenure_month) : 6,
      interest_rate: body.interest_rate || 5,
      monthly_payment: finalPayment,
      type: body.type || 'cash',
      status: 'pending', 
      reason: body.reason || null,
      id_card_url: body.id_card_url,
      full_name_applicant: body.full_name_applicant.trim(),
      nik: cleanNik,
      phone_number: cleanPhone,
      payment_method: body.payment_method || 'DANA'
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([payload])
      .select()
      .single()
      .headers({ Authorization: token }); // 🔥 Meneruskan token untuk bypass RLS

    if (error) throw new Error(error.message);
    return data;
  },

  // 2. AMBIL PINJAMAN MILIK USER TERTENTU
  async getByUser(user, token) {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        products (id, description, price, image_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .headers({ Authorization: token }); // 🔥 Meneruskan token untuk RLS

    if (error) throw new Error(error.message);
    return data;
  },

  // 3. AMBIL SEMUA DATA PINJAMAN (KHUSUS SISI ADMIN)
  async getAllLoansForAdmin(token) {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        products (id, description, price),
        users (id, email, username, balance)
      `)
      .order('created_at', { ascending: false })
      .headers({ Authorization: token }); // 🔥 Meneruskan token admin

    if (error) throw new Error(error.message);
    return data;
  },

  // 4. UPDATE STATUS PINJAMAN OLEH ADMIN (FIX GLITCH SALDO)
  async updateStatusByAdmin(loanId, status, adminId, token) {
    const safeStatus = status.toLowerCase(); 
    
    if (!['approved', 'rejected', 'pending'].includes(safeStatus)) {
      throw new Error('Status tidak valid! Harus pending, approved, atau rejected');
    }

    // 🎯 FIX: Kita ikut panggil kolom 'type' disini buat validasi jenis pinjaman
    const { data: currentLoan, error: fetchLoanError } = await supabase
      .from('loans')
      .select('user_id, loan_amount, status, type') 
      .eq('id', loanId)
      .single()
      .headers({ Authorization: token });

    if (fetchLoanError || !currentLoan) {
      throw new Error('Data pengajuan pinjaman tidak ditemukan, bos!');
    }

    if (currentLoan.status === 'approved') {
      throw new Error('Pinjaman ini sudah disetujui sebelumnya, tidak bisa diubah lagi!');
    }

    // Proses update status pinjaman barang/uang di tabel loans
    const { data: updatedLoan, error: updateLoanError } = await supabase
      .from('loans')
      .update({ 
        status: safeStatus,
        approved_by: adminId,
        update_at: new Date().toISOString() // Menggunakan standar ISO String agar aman di PostgreSQL
      })
      .eq('id', loanId)
      .select()
      .single()
      .headers({ Authorization: token });

    if (updateLoanError) throw new Error(updateLoanError.message);

    // 🎯 FIX MUTLAK: Saldo HANYA bertambah jika status APPROVED dan jenis pinjamannya adalah CASH (Uang)
    if (safeStatus === 'approved' && currentLoan.type === 'cash') {
      const { data: userData, error: fetchUserError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', currentLoan.user_id)
        .single()
        .headers({ Authorization: token });

      if (fetchUserError || !userData) {
        throw new Error('Gagal mengambil data saldo user: ' + fetchUserError?.message);
      }

      const currentBalance = Number(userData.balance || 0);
      const loanAmount = Number(currentLoan.loan_amount || 0);
      const newBalance = currentBalance + loanAmount;

      const { error: updateUserError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', currentLoan.user_id)
        .headers({ Authorization: token });

      if (updateUserError) {
        throw new Error('Pinjaman berubah approved, tapi GAGAL menambah saldo user: ' + updateUserError.message);
      }
    }

    // Jika tipenya 'product', blok IF di atas otomatis dilewati, saldo aman netral 0!
    return updatedLoan;
  }
};