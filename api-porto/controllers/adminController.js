import { adminService } from '../services/adminService.js';

// === USERS CONTROLLER ===
export const getUsers = async (req, res) => {
  try {
    const data = await adminService.getAllUsers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const data = await adminService.updateUser(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === LOANS CONTROLLER ===
export const getLoans = async (req, res) => {
  try {
    const data = await adminService.getAllLoans();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveLoan = async (req, res) => {
  try {
    const result = await adminService.approveLoan(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const rejectLoan = async (req, res) => {
  try {
    const result = await adminService.rejectLoan(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === PRODUCTS CONTROLLER ===
export const createProductController = async (req, res) => {
  try {
    const data = await adminService.createProduct(req.body);
    res.status(201).json(data); // Diubah jadi standar HTTP 201 Created
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const data = await adminService.updateProduct(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const result = await adminService.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// === CATEGORIES CONTROLLER ===
export const getCategories = async (req, res) => {
  try {
    const data = await adminService.getAllCategories();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCategoryController = async (req, res) => {
  try {
    const data = await adminService.createCategory(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const data = await adminService.updateCategory(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const result = await adminService.deleteCategory(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};