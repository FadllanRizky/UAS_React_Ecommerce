import api from './axiosInstance';

// 💬 ambil chat
export const getChats = () => api.get('/chat');

// 👑 admin → list user yang chat
export const getChatUsers = () => api.get('/chat/admin/users');

// ✉️ kirim pesan
export const sendMessage = (data) => api.post('/chat', data);