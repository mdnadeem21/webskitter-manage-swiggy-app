const express = require('express')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')
const uploadFile = require('../utils/upload.file.on.local') 
const FoodController = require('../controller/food.controller')

const router = express.Router()

router.post('/', authenticateToken, authorizePermission('food:create'), uploadFile.single('image'), FoodController.createFood)
router.get('/', FoodController.getAllFoods)
router.get('/search', FoodController.searchAndFilter);
router.get('/:id', FoodController.getFoodById)
router.put('/:id', authenticateToken, authorizePermission('food:update'), uploadFile.single('image'), FoodController.updateFood)
router.delete('/:id', authenticateToken, authorizePermission('food:delete'), FoodController.deleteFood)

module.exports = router
