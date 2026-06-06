export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses diblokir! Khusus perwira administrator bos.' });
  }
  next();
};