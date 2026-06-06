import { createContext, useContext, useState } from 'react';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🔥 LANGSUNG AMBIL DI AWAL BIAR REAL-TIME DAN ANTI-DELAY BEGITU RELOAD Halaman
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // ✅ Fungsi Login Otomatis & Fleksibel
  const login = (apiResponseData) => {
    if (!apiResponseData) return;

    let coreData = apiResponseData.data ? apiResponseData.data : apiResponseData;
    
    if (coreData.data && !coreData.user && !coreData.token && !coreData.access_token) {
      coreData = coreData.data;
    }

    const accessToken = coreData.token || coreData.access_token;
    let userData = coreData.user || coreData;

    if (!accessToken) {
      console.error("🚨 Token tidak ditemukan di response API bos!", apiResponseData);
      Swal.fire({
        title: 'Gagal Sinkronisasi',
        text: 'Token autentikasi tidak ditemukan dalam response server.',
        icon: 'error',
        background: '#111827',
        color: '#fff'
      });
      return;
    }

    // Eksekusi simpan ke ekosistem React & Browser LocalStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', accessToken);

    setUser(userData);
    setToken(accessToken);
    setIsAuthModalOpen(false);

    // Force reload secara bersih agar App.jsx membaca ulang state admin terbaru tanpa interupsi
    window.location.reload();
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    window.location.href = '/'; 
  };

  const checkAuth = () => {
    if (!token) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, checkAuth, isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);