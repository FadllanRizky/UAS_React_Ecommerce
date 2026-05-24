import { createContext, useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { getMyLoans } from '../api/loanApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🔥 Ambil token awal dan data user langsung dari localStorage agar saat di-refresh TIDAK mental
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loans, setLoans] = useState([]);

  // 🔥 Efek untuk mendeteksi token & load data pinjaman secara otomatis
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

  // 🔥 LOGIN FIX (Mendukung Simpan Token + Data User + Role + Saldo)
  const login = (data) => {
    console.log('LOGIN RESPONSE:', data); // 🔥 DEBUG WAJIB

    // 🔥 FLEXIBLE ambil token dari response server bos
    const newToken =
      data?.session?.access_token ||
      data?.access_token ||
      data?.token;

    // 🔥 Ekstrak data user (termasuk role, balance/saldo, full_name)
    const userData = data?.user || data?.customer || null;

    if (!newToken) {
      console.error('TOKEN TIDAK DITEMUKAN!');
      Swal.fire({
        title: 'Login Gagal',
        text: 'Token tidak ditemukan dari server',
        icon: 'error',
        background: '#111827',
        color: '#FFF',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    // Set State Utama
    setToken(newToken);
    setUser(userData);

    // 🔥 Simpan permanen ke LocalStorage biar di-refresh tetap stay di halaman yang sama
    localStorage.setItem('token', newToken);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }

    setIsAuthModalOpen(false);

    Swal.fire({
      title: 'Welcome Back, Bos!',
      text: `Anda berhasil masuk sebagai ${userData?.full_name || 'User'}.`,
      icon: 'success',
      background: '#111827',
      color: '#FFF',
      confirmButtonColor: '#10B981'
    });
  };

  // 🔥 LOGOUT (Bersihkan semua state & storage)
  const logout = () => {
    setToken(null);
    setUser(null);
    setLoans([]);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeTab'); // Opsional: reset tab agar kembali ke produk saat login nanti

    Swal.fire({
      title: 'Logged Out',
      text: 'Anda berhasil keluar dari sistem.',
      icon: 'success',
      background: '#111827',
      color: '#FFF',
      confirmButtonColor: '#10B981'
    });
  };

  // 🔥 Fungsi Update Saldo / Data Profile User Dinamis (Dipakai saat kelar belanja/peminjaman di-ACC)
  const updateUserProfile = (updatedData) => {
    setUser((prevUser) => {
      const mergedData = { ...prevUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(mergedData));
      return mergedData;
    });
  };

  // 🔥 Proteksi fitur bertenaga SweetAlert2
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
        user,
        loans,
        setLoans,
        setUser,
        updateUserProfile, // 🔥 Panggil fungsi ini jika ingin memotong/menambah saldo secara real-time
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