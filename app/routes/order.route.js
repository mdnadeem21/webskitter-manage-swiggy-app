const express = require('express')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')
const uploadFile = require('../utils/upload.file.on.local') 
const OrderController = require('../controller/order.controller')

const router = express.Router()

router.post('/', authenticateToken, OrderController.create)
router.get('/', authenticateToken, OrderController.getAll)
router.get('/:id', authenticateToken, OrderController.getById)
router.patch('/:id', authenticateToken, OrderController.update)
router.delete('/:id', authenticateToken, OrderController.delete)

module.exports = router
