import axios from 'axios';

const API = 'http://localhost:3000/api/loans';

export const getMyLoans = (token) =>
  axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const createLoan = (data, token) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` }
  });