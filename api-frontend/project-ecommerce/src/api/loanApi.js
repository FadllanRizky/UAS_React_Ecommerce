import api from './axiosInstance';

// 👤 USER → ambil loan sendiri
export const getMyLoans = () => api.get('/loans/me');

// 👤 USER → ajukan pinjaman + upload KTP
export const createLoan = (formData) =>
  api.post('/loans', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

// 👑 ADMIN → ambil semua loan
export const getAllLoansAdmin = () => api.get('/admin/loans');

// 👑 ADMIN → approve / reject
export const updateLoanStatusAdmin = (loanId, status) =>
  api.put(`/admin/loans/status/${loanId}`, { status });