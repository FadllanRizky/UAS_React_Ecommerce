import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, X, Send, User } from 'lucide-react';
import axios from 'axios';

export default function LiveChatWidget() {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/chat', { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);
    } catch (err) {
      console.error("Gagal sinkronisasi chat:", err);
    }
  };

  // Pooling 2 detik sekali agar data chat ter-update real-time antar dua tab
  useEffect(() => {
    if (!token || !isOpen) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [token, isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const payload = { message: inputMessage, sender_role: user?.role };
      await axios.post('/api/chat', payload, { headers: { Authorization: `Bearer ${token}` } });
      setInputMessage('');
      fetchMessages();
    } catch (err) {
      console.error("Gagal kirim pesan:", err);
    }
  };

  if (!token) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Tombol Trigger Buka Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center border border-emerald-400/20"
        >
          <MessageSquare size={24} />
          {user?.role === 'admin' && <span className="absolute -top-1 -right-1 bg-rose-500 text-[9px] px-1.5 py-0.5 rounded-full font-bold">ADM</span>}
        </button>
      )}

      {/* Box Chat Premium Layout */}
      {isOpen && (
        <div className="w-80 h-96 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-black tracking-wider text-white uppercase">
                {user?.role === 'admin' ? "Live Hub - Customer Chat" : "Konsultasi Spesifikasi Admin"}
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Area Pesan */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-slate-500 mb-0.5 font-bold uppercase tracking-tight">
                    {msg.sender_role}
                  </span>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs font-medium leading-relaxed ${
                    isMe ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pesan konsultasi bos..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
            />
            <button type="submit" className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}