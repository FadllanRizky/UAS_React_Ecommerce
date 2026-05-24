import express from 'express';
import cors from 'cors';
import path from 'path'; // 🔥 Tambahkan ini untuk handle static folder

// 🔥 ROUTES
import authRoutes from '../routes/authRoute.js';
import categoryRoutes from '../routes/categoryRoute.js';
import productRoutes from '../routes/productRoute.js';
import loanRoutes from '../routes/loanRoute.js'; 

const app = express();

// 🔥 CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 🔥 MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 EXPOSE FOLDER UPLOADS: Biar gambar KTP bisa diakses via url browser (http://localhost:3000/uploads/nama-file.jpg)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 🔥 TEST
app.get('/', (req, res) => {
  res.send('API running...');
});

// 🔥 ROUTES REGISTERED
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/loans', loanRoutes); 

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