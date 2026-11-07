const express = require('express');
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check');
const adminController = require('../controller/admin.controller');

const router = express.Router();

// Every admin route: valid token + admin role. Two gates, one line each.
router.use(authenticateToken, authorizePermission('admin:all'));

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/block', adminController.toggleBlock);
router.patch('/users/:id/unblock', adminController.toggleBlock);

// Restaurants
router.get('/restaurants', adminController.getRestaurants);

// Orders
router.get('/orders', adminController.getOrders);

// Categories
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Statistics
router.get('/stats', adminController.getStats);

module.exports = router;