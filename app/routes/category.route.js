const express = require('express')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')
const uploadFile = require('../utils/upload.file.on.local') 
const CategoryController = require('../controller/category.controller')

const router = express.Router()

router.post('/', authenticateToken, authorizePermission('category:create'), uploadFile.single('image'), CategoryController.create)
router.get('/', CategoryController.getAll)
router.get('/:id', CategoryController.getById)
router.put('/:id', authenticateToken, authorizePermission('category:update'), uploadFile.single('image'), CategoryController.update)
router.delete('/:id', authenticateToken, authorizePermission('category:delete'), CategoryController.remove)

module.exports = router
