const express = require('express')
const {
  authenticateToken,
  authorizePermission,
} = require('../middleware/auth.role.check')
const OrderController = require('../controller/order.controller')

const router = express.Router()

router.use(authenticateToken)

router.post(
  '/',
  authorizePermission('order:create'),   // user role
  OrderController.create
)

router.get(
  '/',
  authorizePermission('order:read'),
  OrderController.getAll
)

router.get(
  '/:id',
  authorizePermission('order:read'),
  OrderController.getById
)

router.patch(
  '/:id/status',
  authorizePermission('order:update-status'),
  OrderController.updateStatus
)


module.exports = router