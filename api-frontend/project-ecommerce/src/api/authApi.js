import axios from 'axios';

const API = 'http://localhost:3000/api/auth';

export const loginApi = (data) => axios.post(`${API}/login`, data);
export const registerApi = (data) => axios.post(`${API}/register`, data);