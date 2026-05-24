import axios from 'axios';

const API = 'http://localhost:3000/api/loans';

export const getMyLoans = (token) =>
  axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// 🔥 SESUAIKAN: Content-Type diubah agar Axios tahu ini adalah pengiriman FormData berkas KTP
export const createLoan = (formData, token) =>
  axios.post(API, formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });

// 🔥 TAMBAHAN UNTUK ADMIN: Hit endpoint panel kontrol admin
export const getAllLoansAdmin = (token) =>
  axios.get(`${API}/admin/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateLoanStatusAdmin = (loanId, status, token) =>
  axios.put(`${API}/admin/status/${loanId}`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });