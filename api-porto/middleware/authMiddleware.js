import { supabase } from '../config/db.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized - No Token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Token kosong' });
    }

    // 🔥 WAJIB: pakai ini (lebih stabil)
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    console.log("USER:", user);
    console.log("ERROR:", error);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Auth error' });
  }
};  