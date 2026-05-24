import axios from 'axios';

const API = 'http://localhost:3000/api';

// ==========================================
// 🔥 AXIOS INTERCEPTOR (ANTI-MANUAL HEADERS)
// ==========================================
// Setiap kali aplikasi frontend menembak API ke backend, 
// fungsi ini akan otomatis memeriksa & menyisipkan token JWT dari localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Otomatis tangani jika token kadaluarsa / invalid dari server (Error 401)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token tidak valid atau kadaluarsa, membersihkan session...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Opsi tambahan bos: window.location.reload() jika ingin paksa refresh halaman
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 🔐 ENDPOINT UTAMA AUTHENTICATION BOS
// ==========================================
export const loginApi = (data) => axios.post(`${API}/auth/login`, data);
export const registerApi = (data) => axios.post(`${API}/auth/register`, data);

// Contoh endpoint fitur lain milik bos yang otomatis terproteksi token di atas:
// export const getMyLoans = () => axios.get(`${API}/loans/my-loans`);