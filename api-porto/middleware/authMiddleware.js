import { supabase } from '../config/db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Sesi kedaluwarsa / token tidak valid' });
    }

    // 🔥 CEK LINKING KE TABEL ADMINS
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    req.user = {
      ...user,
      role: admin ? 'admin' : 'customer'
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Gangguan Autentikasi Sistem' });
  }
};