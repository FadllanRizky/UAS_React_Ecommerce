import express from 'express';
import {
  getProducts,
  createProduct,
  bulkCreateProducts,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);

// 🔐 protected
router.post('/', authMiddleware, createProduct);
router.post('/bulk', authMiddleware, bulkCreateProducts);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;