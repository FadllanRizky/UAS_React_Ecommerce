import { supabase } from '../config/db.js';

export const authService = {

  // 🔐 LOGIN
  // 🔐 LOGIN FIX & KOKOH
  async login(email, password) {
    console.log("=== PROSES LOGIN DIMULAI ===");
    console.log("Mencoba login untuk email:", email);

    // 1. Tembak langsung ke Supabase Auth bawaan
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(), // Antispasi ada spasi tidak sengaja
      password: password
    });

    // Jika Supabase Auth menolak (Password salah / email salah)
    if (error) {
      console.error("Supabase Auth Error:", error.message);
      throw new Error("Email atau password yang bos masukkan salah!");
    }

    const user = data.user;
    console.log("Supabase Auth Berhasil! User ID:", user.id);

    // 2. Ambil profile user dari tabel public.users untuk mengambil SALDO & ROLE
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Gagal mengambil data dari tabel users:", profileError.message);
      throw new Error("Gagal memuat profil database: " + profileError.message);
    }

    // 3. JIKA PROFILE DI TABEL 'USERS' BELUM DIBUAT (Sering terjadi saat register bypass)
    // Kita buatkan otomatis (auto-fallback) biar user TIDAK gagal login!
    let finalProfile = profile;
    if (!profile) {
      console.log("Profil di tabel users tidak ditemukan! Membuat profil otomatis...");
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.email.split('@')[0], // Gunakan nama depan email sebagai fallback
            role: 'customer',
            credit_score: 50,
            loan_limit: 2000000,
            balance: 2000000 // Berikan saldo otomatis jika belum ada
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Gagal membuat profil otomatis:", insertError.message);
        throw new Error("Gagal sinkronisasi data profil baru.");
      }
      finalProfile = newProfile;
    }

    console.log("=== LOGIN BERHASIL LENGKAP ===");
    
    // Kembalikan struktur data yang klop dengan frontend AuthContext bos
    return {
      user: {
        id: user.id,
        email: user.email,
        ...finalProfile
      },
      session: data.session
    };
  },
  // 📝 REGISTER + HADIAH SALDO AWAL Rp 2.000.000
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

    // 🔥 1. REGISTER KE AUTH SUPABASE
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw new Error(error.message);

    const user = data.user;

    if (!user) {
      throw new Error('Gagal membuat user auth');
    }

    // 🔥 2. INSERT KE TABLE USERS + DEPOSIT SALDO DAFTAR
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email,
          full_name,
          role: 'customer',
          credit_score: 50,
          loan_limit: 2000000,
          balance: 2000000 // 🔥 HADIAH PENGGUNA BARU LANGSUNG DAPAT Rp 2.000.000 BOS!
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
      message: 'Register berhasil, silakan login bos!'
    };
  }
};