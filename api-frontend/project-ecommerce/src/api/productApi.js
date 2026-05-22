import axios from 'axios';

const API = 'http://localhost:3000/api/products';

export const getProducts = () => axios.get(API);

export const createProduct = (data, token) =>
  axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` }
  });