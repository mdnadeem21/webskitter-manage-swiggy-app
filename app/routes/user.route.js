const express = require('express')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')
const uploadFile = require('../utils/upload.file.on.local') 
const UserController = require('../controller/user.controller')

const router = express.Router()

router.post('/register', uploadFile.single('profileImage'), UserController.register)
router.post('/login', UserController.login)

// router.get('/', authenticateToken, authorizePermission('user:read'), UserController.)
router.get('/profile', authenticateToken, UserController.getProfile)
router.get('/:id', authenticateToken, authorizePermission('user:read'), UserController.getUserId)
// router.put('/profile', authenticateToken, uploadFile.single('profileImage'), UserController.updateProfile)
router.put('/:id', authenticateToken, authorizePermission('user:update'), uploadFile.single('profileImage'), UserController.getProfile)
router.delete('/:id', authenticateToken, authorizePermission('user:delete'), UserController.deleteAccount)

module.exports = router
