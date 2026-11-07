

const Restaurant = require("../model/restaurant.model")
class RestaurantController {


	async create(req, res, next) {
		try {
			const { name, description, cuisines, address, } = req.body
			if (!name || !description || !address) {
				return res.status(400).json({
					status: false,
					message: "Name, Address and description are required"
				})

			}
			const isRestaurantExist = await findOne({ name })
			if (isRestaurantExist) {
				return res.status(400).json({
					status: false,
					message: "Restaurant already Exist"
				})
			}
			const restaurant = await Restaurant.create({ name, address, description, cuisines });
			return res.status(201).json(restaurant);
		} catch (error) {
			return next(error);
		}
	}

	async getAll(req, res, next) {
		try {
			const restaurants = await this.Restaurant.find();
			return res.status(200).json(restaurants);
		} catch (error) {
			return next(error);
		}
	}

	async getById(req, res, next) {
		try {
			const restaurant = await this.Restaurant.findById(req.params.id);
			if (!restaurant) {
				return res.status(404).json({ message: "Restaurant not found" });
			}
			return res.status(200).json(restaurant);
		} catch (error) {
			return next(error);
		}
	}

	async update(req, res, next) {
		try {
			const restaurant = await this.Restaurant.findByIdAndUpdate(
				req.params.id,
				req.body,
				{ new: true, runValidators: true }
			);
			if (!restaurant) {
				return res.status(404).json({ message: "Restaurant not found" });
			}
			return res.status(200).json(restaurant);
		} catch (error) {
			return next(error);
		}
	}

	async delete(req, res, next) {
		try {
			const restaurant = await this.Restaurant.findByIdAndDelete(req.params.id);
			if (!restaurant) {
				return res.status(404).json({ message: "Restaurant not found" });
			}
			return res.status(200).json({ message: "Restaurant deleted successfully" });
		} catch (error) {
			return next(error);
		}
	}

	
	async search(req, res) {
		try {
			const { search } = req.query;
			const filter = {};
			if (search && search.trim()) {
				filter.name = { $regex: search.trim(), $options: 'i' }; // case-insensitive partial match
			}
			const restaurants = await Restaurant.find(filter).limit(50);
			return res.status(200).json(restaurants);
		} catch (error) {
			return res.status(500).json({ message: 'Failed to search restaurants' });
		}
	}
}

module.exports = new RestaurantController();
