const express = require('express');
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check');
const cartController = require('../controller/cart.controller');

const router = express.Router();

router.use(authenticateToken); 

router.post('/', authorizePermission('cart:manage'), cartController.addItem);          // add food
router.get('/', authorizePermission('cart:manage'), cartController.getCart);          // view cart + total
router.patch('/:foodId', authorizePermission('cart:manage'), cartController.updateQuantity); // + / -
router.delete('/:foodId', authorizePermission('cart:manage'), cartController.removeItem);    // remove one
router.delete('/', authorizePermission('cart:manage'), cartController.clearCart);      // clear cart

module.exports = router;