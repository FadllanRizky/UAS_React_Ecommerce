import { loanService } from '../services/loanService.js';

export const createLoan = async (req, res) => {
  try {
    const data = await loanService.create(req.body, req.user);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMyLoans = async (req, res) => {
  try {
    const data = await loanService.getByUser(req.user);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};