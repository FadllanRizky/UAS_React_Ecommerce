import { supabase } from '../config/db.js'; // Menggunakan gaya import ESM sesuai request lu, boskuh!

const chatController = {
  
  // 👑 1. Ambil daftar user yang memiliki riwayat chat (Untuk Sidebar Admin)
  // NAMA DISAMAKAN: Dari getAdminChatUsers menjadi getChatUsers
  getChatUsers: async (req, res) => {
    try {
      // Ambil customer_id unik dari tabel chat beserta relasi profil user-nya
      const { data: chatMessages, error: chatError } = await supabase
        .from('chat_messages')
        .select(`
          customer_id,
          users:customer_id (id, full_name, email)
        `);

      if (chatError) throw chatError;

      // Filter agar list user unik (tidak duplikat) di level Node.js
      const uniqueUsers = [];
      const seenIds = new Set();

      chatMessages?.forEach((item) => {
        if (item.users && !seenIds.has(item.users.id)) {
          seenIds.add(item.users.id);
          uniqueUsers.push({
            id: item.users.id,
            full_name: item.users.full_name,
            email: item.users.email
          });
        }
      });

      // Kembalikan data langsung dalam bentuk array sesuai kebutuhan frontend (.data || [])
      return res.status(200).json(uniqueUsers);
    } catch (error) {
      console.error("🚨 Error getChatUsers:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  // 💬 2. Ambil semua riwayat chat (SINKRON UNTUK USER & ADMIN VIA QUERY STRINGS)
  // NAMA DISAMAKAN: Dari getChatMessages menjadi getChats
  getChats: async (req, res) => {
    try {
      const { role, id: userId } = req.user; // Data dari verifyToken middleware
      let customerId = userId;

      // Jalur Pintas: Jika yang akses adalah admin, ambil ID target dari query (?target_user=ID)
      if (role === 'admin') {
        customerId = req.query.target_user;
        // Jika admin baru buka widget dan belum milih room, bypass kembalikan array kosong
        if (!customerId) {
          return res.status(200).json([]);
        }
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error) {
      console.error("🚨 Error getChats:", error.message);
      return res.status(500).json({ error: error.message });
    }
  },

  // ✉️ 3. Kirim Pesan Baru (Mendukung Payload dinamis dari Customer maupun Admin)
  sendMessage: async (req, res) => {
    try {
      const { message, target_user_id } = req.body;
      const { id: sender_id, role: sender_role } = req.user; // Diambil otomatis dari middleware pelindung token

      // LOGIKA ROOM (customer_id):
      // Jika admin yang kirim chat, room targetnya adalah 'target_user_id'. 
      // Jika customer biasa yang kirim chat, room targetnya adalah dirinya sendiri ('sender_id').
      const customer_id = sender_role === 'admin' ? target_user_id : sender_id;

      if (!customer_id || !message) {
        return res.status(400).json({ error: "Isian data chat atau room target tidak lengkap boskuh!" });
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            customer_id,
            sender_id,
            sender_role,
            message
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (error) {
      console.error("🚨 Error sendMessage:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }
};

export default chatController; // Eksport menggunakan standar ES Module!