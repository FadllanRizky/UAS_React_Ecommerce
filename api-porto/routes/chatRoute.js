import express from 'express';
import chatController from '../controllers/chatController.js'; 
// 🔑 Mengimpor nama middleware asli milik lu boskuh, tanpa merubah filenya sedikit pun!
import { authMiddleware} from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
const router = express.Router();

// 👑 Admin → List user yang pernah chat (GET /api/chat/admin/users)
// Memakai 'authMiddleware' untuk cek login, dan 'adminMiddleware' untuk kunci khusus admin
router.get('/admin/users', authMiddleware, adminMiddleware, chatController.getChatUsers);

// 💬 Ambil riwayat chat (GET /api/chat) -> Mendukung query ?target_user=ID
// Cukup pakai 'authMiddleware' karena customer biasa dan admin bisa akses rute ini
router.get('/', authMiddleware, chatController.getChats);

// ✉️ Kirim pesan baru (POST /api/chat)
// Cukup pakai 'authMiddleware'
router.post('/', authMiddleware, chatController.sendMessage);

export default router;