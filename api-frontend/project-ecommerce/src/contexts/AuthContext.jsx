import { createContext, useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { getMyLoans, createLoan } from '../api/loanApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loans, setLoans] = useState([]);

  // 🔥 Load token dari localStorage
 useEffect(() => {
  if (!token) return;

  const fetchData = async () => {
    try {
      const res = await getMyLoans(token);
      setLoans(res.data || []);
    } catch (err) {
      console.error("Gagal load loan:", err.response?.data || err);
    }
  };

  fetchData();
}, [token]);

  // 🔥 LOGIN FIX (ANTI ERROR)
  const login = (data) => {
    console.log('LOGIN RESPONSE:', data); // 🔥 DEBUG WAJIB

    // 🔥 FLEXIBLE ambil token (biar gak error lagi)
    const newToken =
      data?.session?.access_token ||
      data?.access_token ||
      data?.token;

    if (!newToken) {
      console.error('TOKEN TIDAK DITEMUKAN!');
      Swal.fire({
        title: 'Login Gagal',
        text: 'Token tidak ditemukan dari server',
        icon: 'error'
      });
      return;
    }

    setToken(newToken);
    localStorage.setItem('token', newToken);
    setIsAuthModalOpen(false);

    Swal.fire({
      title: 'Welcome Back, Bos!',
      text: 'Anda berhasil masuk ke aplikasi.',
      icon: 'success',
      background: '#111827',
      color: '#FFF',
      confirmButtonColor: '#10B981'
    });
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');

    Swal.fire({
      title: 'Logged Out',
      text: 'Anda berhasil keluar dari sistem.',
      icon: 'success',
      background: '#111827',
      color: '#FFF',
      confirmButtonColor: '#10B981'
    });
  };

  // 🔥 Proteksi fitur
  const checkAuth = () => {
    if (!token) {
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Harap login dulu bos',
        icon: 'warning',
        background: '#111827',
        color: '#E2E8F0',
        confirmButtonColor: '#EF4444',
        showCancelButton: true,
        confirmButtonText: 'Login Sekarang',
        cancelButtonText: 'Nanti'
      }).then((result) => {
        if (result.isConfirmed) {
          setAuthMode('login');
          setIsAuthModalOpen(true);
        }
      });
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);