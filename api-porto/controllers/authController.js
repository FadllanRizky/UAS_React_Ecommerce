import { authService } from '../services/authService.js';
import { supabase } from '../config/db.js';

// 🔐 REGISTER
export const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    const result = await authService.register({
      email,
      password,
      full_name
    });

    res.json(result);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json(result);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔥 RESEND EMAIL
export const resendEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Email dikirim ulang' });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};