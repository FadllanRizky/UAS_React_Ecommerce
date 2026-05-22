import express from 'express';
import { login, register, resendEmail } from '../controllers/authController.js';
import { validateRegister } from '../validations/authValidation.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', validateRegister, register);
router.post('/resend', resendEmail);

export default router;