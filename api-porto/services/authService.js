import { supabase } from '../config/db.js';

export const authService = {

  // ================= LOGIN =================
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      throw new Error('Email atau password salah');
    }

    const user = data.user;

    // 🔥 ambil profile
    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // 🔥 kalau belum ada → buat otomatis
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .upsert([
          {
            id: user.id,
            email: user.email,
            full_name: user.email.split('@')[0],
            role: 'customer',
            credit_score: 50,
            loan_limit: 2000000,
            balance: 2000000
          }
        ])
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      profile = newProfile;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        ...profile
      },
      session: data.session
    };
  },

  // ================= REGISTER =================
  async register({ email, password, full_name }) {

    // 🔥 CEK EMAIL (BUKAN NAMA!)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    // 🔥 REGISTER KE AUTH
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw new Error(error.message);

    const user = data.user;

    if (!user) {
      throw new Error('Gagal membuat user');
    }

    // 🔥 SIMPAN KE TABLE USERS (PAKAI UPSERT)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .upsert([
        {
          id: user.id,
          email,
          full_name,
          role: 'customer',
          credit_score: 50,
          loan_limit: 2000000,
          balance: 2000000
        }
      ])
      .select()
      .single();

    if (profileError) throw new Error(profileError.message);

    return {
      user: {
        id: user.id,
        email,
        ...profile
      },
      message: 'Register berhasil bos!'
    };
  }
};