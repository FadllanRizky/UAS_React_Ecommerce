import { loanService } from '../services/loanService.js';

export const createLoan = async (req, res) => {
  try {
    const bodyData = { ...req.body };

    // 🔥 Jika ada file KTP yang diupload oleh Multer, pasang path-nya ke id_card_url
    if (req.file) {
      bodyData.id_card_url = `/uploads/${req.file.filename}`;
    }

    const data = await loanService.create(bodyData, req.user);
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

// 🔥 CONTROLLER ADMIN: Mengambil antrean seluruh data pinjaman
export const getAllLoans = async (req, res) => {
  try {
    // Keamanan lapis ganda: pastikan yang request adalah admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Anda bukan admin, bos!' });
    }
    const data = await loanService.getAllLoansForAdmin();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔥 CONTROLLER ADMIN: Eksekusi aksi Approve / Reject
export const updateLoanStatus = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Anda bukan admin, bos!' });
    }
    
    const { id } = req.params;
    const { status } = req.body; // 'approved' atau 'rejected'

    const data = await loanService.updateStatusByAdmin(id, status, req.user.id);
    res.json({ message: `Berhasil mengubah status pinjaman menjadi ${status.toLowerCase()}`, data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};