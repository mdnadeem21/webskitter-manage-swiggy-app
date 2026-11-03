const Food = require('../model/food.model');

class FoodController {
	async createFood(req, res) {
		try {
            const { name, description, price, category, restaurant } = req.body
            if(!name || !description || price || !restaurant){
                return res.status(false).json({
                    status:false,
                    message:"All fields are required"
                })
            }
            const isFoodExist= await findOne({name})
            if(isFoodExist){
                return res.status(400).json({
                    status:false,
                    message:"Food Name already exist"
                })
            }
			const food = await Food.create({
                name,description,price,category,restaurant
            });
			return res.status(201).json({ success: true, data: food });
		} catch (error) {
			return res.status(400).json({ success: false, message: error.message });
		}
	}

	async getAllFoods(req, res) {
		try {
			const foods = await Food.find();
			return res.status(200).json({ success: true, data: foods });
		} catch (error) {
			return res.status(500).json({ success: false, message: error.message });
		}
	}

	async getFoodById(req, res) {
		try {
			const food = await Food.findById(req.params.id);
			if (!food) {
				return res.status(404).json({ success: false, message: 'Food not found' });
			}
			return res.status(200).json({ success: true, data: food });
		} catch (error) {
			return res.status(400).json({ success: false, message: error.message });
		}
	}

	async updateFood(req, res) {
		try {
			const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});
			if (!food) {
				return res.status(404).json({ success: false, message: 'Food not found' });
			}
			return res.status(200).json({ success: true, data: food });
		} catch (error) {
			return res.status(400).json({ success: false, message: error.message });
		}
	}

	async deleteFood(req, res) {
		try {
			const food = await Food.findByIdAndDelete(req.params.id);
			if (!food) {
				return res.status(404).json({ success: false, message: 'Food not found' });
			}
			return res.status(200).json({
				success: true,
				message: 'Food deleted successfully',
			});
		} catch (error) {
			return res.status(400).json({ success: false, message: error.message });
		}
	}
}

module.exports = new FoodController();
