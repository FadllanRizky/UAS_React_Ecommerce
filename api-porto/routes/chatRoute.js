import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { supabase } from '../config/db.js';

const router = express.Router();

// ================== GET CHAT ==================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true });

    if (role === 'customer') {
      // 🔥 user hanya lihat chat dia sendiri
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    } else {
      // 🔥 admin bisa filter by user
      const targetUser = req.query.target_user;

      if (targetUser) {
        query = query.or(`sender_id.eq.${targetUser},receiver_id.eq.${targetUser}`);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== ADMIN: LIST USER CHAT ==================
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('sender_id')
      .neq('sender_role', 'admin');

    if (error) throw error;

    const uniqueIds = [...new Set(data.map(x => x.sender_id))];

    if (uniqueIds.length === 0) {
      return res.json([]);
    }

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, balance')
      .in('id', uniqueIds);

    if (userError) throw userError;

    res.json(users || []);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================== SEND MESSAGE ==================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, target_user_id } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message tidak boleh kosong' });
    }

    let receiverId = null;

    // 🔥 kalau admin → wajib ada target
    if (req.user.role === 'admin') {
      if (!target_user_id) {
        return res.status(400).json({ error: 'Target user wajib diisi' });
      }
      receiverId = target_user_id;
    }

    const payload = {
      sender_id: req.user.id,
      sender_role: req.user.role,
      message: message.trim(),
      receiver_id: receiverId
    };

    const { data, error } = await supabase
      .from('chats')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;