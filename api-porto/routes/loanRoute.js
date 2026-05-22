import express from 'express';
import { createLoan, getMyLoans } from '../controllers/loanController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createLoan);
router.get('/me', authMiddleware, getMyLoans);

export default router;