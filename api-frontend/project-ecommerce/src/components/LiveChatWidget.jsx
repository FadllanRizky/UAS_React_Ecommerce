import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, X, Send, User, Mail, ShieldAlert, CircleDot } from 'lucide-react';

// 👑 SEKARANG SINKRON KE SERVICE API LU BOSKUH!
// (Pastikan path import ini mengarah dengan benar ke file chatApi.js lu ya)
import { getChats, getChatUsers, sendMessage } from '../api/chatApi'; 

export default function LiveChatWidget() {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Data Identitas Pengirim (Pre-Chat Form)
  const [chatIdentity, setChatIdentity] = useState({ name: '', email: '' });
  const [isIdentified, setIsIdentified] = useState(false);

  // State Manajemen Chat
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatUsers, setChatUsers] = useState([]); 
  const [activeChatUser, setActiveChatUser] = useState(null); 
  const [activeChatUserData, setActiveChatUserData] = useState(null); 

  const chatEndRef = useRef(null);

  // Auto-fill data identitas kalau user reguler sudah login
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setChatIdentity({
        name: user.full_name || user.name || '',
        email: user.email || ''
      });
      if (user.full_name && user.email) {
        setIsIdentified(true);
      }
    }
  }, [user]);

  // Listener Global Pemanggil Chat Gaib dari Card Produk
  useEffect(() => {
    const handleTriggerChat = (e) => {
      setIsOpen(true);
      if (e.detail?.targetUser) {
        setActiveChatUser(e.detail.targetUser);
      }
    };
    window.addEventListener('trigger-mbur-chat', handleTriggerChat);
    return () => window.removeEventListener('trigger-mbur-chat', handleTriggerChat);
  }, []);

  // 👑 ADMIN: Ambil daftar list user yang pernah nge-chat pakai chatApi
  const fetchChatUsers = async () => {
    if (user?.role !== 'admin' || !token) return;
    try {
      const res = await getChatUsers(); // Menggunakan fungsi dari chatApi.js
      setChatUsers(res.data || []);
    } catch (err) {
      console.error("Gagal memuat daftar user chat:", err);
    }
  };

  // 💬 ALL: Sinkronisasi isi ruang obrolan pakai chatApi
  const fetchMessages = async () => {
    if (!token || !isOpen) return;
    try {
      // Susun query parameter secara elegan menggunakan Axios params object
      const queryParams = user?.role === 'admin' && activeChatUser 
        ? { target_user: activeChatUser } 
        : {};

      const res = await getChats(queryParams); // Menggunakan fungsi dari chatApi.js
      setMessages(res.data || []);
    } catch (err) {
      console.error("Gagal sinkronisasi isi chat:", err);
    }
  };

  // Polling Loop Interval 2 Detik
  useEffect(() => {
    if (!token || !isOpen) return;

    fetchMessages();
    if (user?.role === 'admin') fetchChatUsers();

    const interval = setInterval(() => {
      fetchMessages();
      if (user?.role === 'admin') fetchChatUsers();
    }, 2000);

    return () => clearInterval(interval);
  }, [token, isOpen, activeChatUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = (e) => {
    e.preventDefault();
    if (!chatIdentity.name.trim() || !chatIdentity.email.trim()) return;
    setIsIdentified(true);
  };

  // ✉️ Kirim Pesan pakai chatApi
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const payload = { 
        message: inputMessage, 
        client_name: chatIdentity.name,
        client_email: chatIdentity.email,
        target_user_id: user?.role === 'admin' ? activeChatUser : null 
      };

      await sendMessage(payload); // Menggunakan fungsi dari chatApi.js
      setInputMessage('');
      fetchMessages(); 
    } catch (err) {
      console.error("Gagal kirim pesan bos:", err);
    }
  };

  if (!token) return null;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* 🟢 TOMBOL BULAT LIVE CHAT WIDGET */}
      {!isOpen && (
        <button
          id="live-chat-trigger-btn"
          onClick={() => setIsOpen(true)}
          className="p-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl transition-all flex items-center justify-center transform hover:scale-105 active:scale-95 duration-200"
        >
          <div className="relative">
            <MessageSquare size={24} />
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
        </button>
      )}

      {/* 🔮 MAIN INTERFACE LAYOUT */}
      {isOpen && (
        <div className={`bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl flex overflow-hidden animate-in slide-in-from-bottom-5 duration-300 h-[500px] ${
          isAdmin ? 'w-[750px]' : 'w-[360px]'
        }`}>
          
          {/* PANEL SIDEBAR KHUSUS ADMIN */}
          {isAdmin && (
            <div className="w-1/3 bg-slate-900/90 border-r border-slate-800 flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-slate-950/40">
                <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">Antrean Konsultasi</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Pilih user untuk balas chat</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                {chatUsers.length === 0 ? (
                  <div className="p-6 text-center text-slate-600 text-xs">Belum ada user chat bos.</div>
                ) : (
                  chatUsers.map((u, idx) => {
                    const isSelected = activeChatUser === u.id || activeChatUser === u.sender_id;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          const targetId = u.sender_id || u.id;
                          setActiveChatUser(targetId);
                          setActiveChatUserData({
                            name: u.full_name || u.client_name || 'Anonymous User',
                            email: u.email || u.client_email || 'No Gmail Connected'
                          });
                        }}
                        className={`w-full text-left p-3 flex flex-col gap-0.5 transition-all duration-150 ${
                          isSelected ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-200 line-clamp-1">
                          {u.full_name || u.client_name || 'Bos Toko Baru'}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 italic font-mono">
                          {u.email || u.client_email || 'tidak_ada_gmail@gmail.com'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* RUANG OBROLAN UTAMA */}
          <div className="flex-1 flex flex-col bg-[#0b0f19]">
            
            <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex justify-between items-center backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <CircleDot size={10} className="text-emerald-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-wider text-white uppercase">
                    {isAdmin 
                      ? (activeChatUserData ? `Chat: ${activeChatUserData.name}` : "Pilih Room") 
                      : "Konsultasi Spesifikasi Admin"
                    }
                  </span>
                  {isAdmin && activeChatUserData && (
                    <span className="text-[9px] text-slate-400 font-mono tracking-tight lowercase">
                      {activeChatUserData.email}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>

            {!isAdmin && !isIdentified ? (
              
              /* TAMPILAN PRE-CHAT FORM IDENTITAS USER */
              <form onSubmit={handleStartChat} className="flex-1 p-6 flex flex-col justify-center gap-4 bg-slate-950/20">
                <div className="text-center mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 text-emerald-400">
                    <User size={20} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Yuk Kenalan Dulu Boskuh!</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Biar admin gampang cek status saldo & pinjaman lu</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Panggilan</label>
                    <div className="relative">
                      <User size={12} className="absolute left-3 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={chatIdentity.name}
                        onChange={(e) => setChatIdentity({...chatIdentity, name: e.target.value})}
                        placeholder="Contoh: Fadllan Rizky"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Akun Gmail</label>
                    <div className="relative">
                      <Mail size={12} className="absolute left-3 top-3.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={chatIdentity.email}
                        onChange={(e) => setChatIdentity({...chatIdentity, email: e.target.value})}
                        placeholder="username@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/20"
                >
                  Mulai Konsultasi Bisnis Bos!
                </button>
              </form>

            ) : (

              /* AREA CHATTING UTAMA */
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30">
                  {isAdmin && !activeChatUser ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                      <ShieldAlert size={32} className="mb-2 text-slate-700" />
                      <p className="text-xs font-bold">Belum ada room yang dipilih</p>
                      <p className="text-[10px] text-slate-500 mt-1">Silakan klik salah satu nama user di sidebar kiri untuk membalas obrolan bos.</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-[11px] text-slate-600 pt-16 font-medium">Belum ada percakapan masuk bos.</p>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-[8px] text-slate-500 mb-0.5 font-bold uppercase tracking-widest">
                            {isMe ? 'Anda' : (msg.sender_role || 'Customer')}
                          </span>
                          <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs font-medium leading-relaxed shadow-md ${
                            isMe 
                              ? 'bg-emerald-500 text-white rounded-tr-none' 
                              : 'bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tl-none'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isAdmin && !activeChatUser}
                    placeholder={isAdmin && !activeChatUser ? "Pilih user dulu bos..." : "Ketik balasan konsultasi bos..."}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white disabled:opacity-40 transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={isAdmin && !activeChatUser}
                    className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-colors shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      )}

    </div>
  );
}