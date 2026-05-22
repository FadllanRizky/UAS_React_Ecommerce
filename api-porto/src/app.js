import express from 'express';
import cors from 'cors';

// 🔥 ROUTES
import authRoutes from '../routes/authRoute.js';
import categoryRoutes from '../routes/categoryRoute.js';
import productRoutes from '../routes/productRoute.js';
import loanRoutes from '../routes/loanRoute.js'; // ⬅️ TAMBAH INI

const app = express();

// 🔥 CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 🔥 MIDDLEWARE
app.use(express.json());

// 🔥 TEST
app.get('/', (req, res) => {
  res.send('API running...');
});

// 🔥 ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/loans', loanRoutes); // ⬅️ INI YANG KURANG

// 🔥 ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 🔥 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    message: 'Route tidak ditemukan'
  });
});

// 🔥 RUN SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;