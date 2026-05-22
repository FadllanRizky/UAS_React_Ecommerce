import { supabase } from '../config/db.js';

export const authService = {

  // 🔐 LOGIN
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);

    const user = data.user;

    // ambil profile user
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);

    return {
      user,
      profile,
      session: data.session
    };
  },

  // 📝 REGISTER
  async register({ email, password, full_name }) {

    // 🔥 0. CEK USERNAME SUDAH ADA ATAU BELUM
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('full_name', full_name)
      .maybeSingle();

    if (existingUser) {
      throw new Error('Username sudah digunakan');
    }

    // 🔥 1. REGISTER KE AUTH
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw new Error(error.message);

    const user = data.user;

    if (!user) {
      throw new Error('Gagal membuat user');
    }

    // 🔥 2. INSERT KE TABLE USERS
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email,
          full_name,
          role: 'customer'
        }
      ])
      .select()
      .single();

    if (profileError) throw new Error(profileError.message);

    return {
      user,
      profile,
      message: 'Register berhasil'
    };
  }

};