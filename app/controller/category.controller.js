const Category = require('../model/category.model')


class CategoryController {
	

	async create(req, res, next) {
		try {
            const { name, description } =req.body
            if(!name || !description){
                return res.status(400).json({
                    status:false,
                    message:"Name and Description required"
                })
            }
			const category = await Category.create({name, description});
			return res.status(201).json(category);
		} catch (error) {
			if (next) return next(error);
			return res.status(500).json({ message: "Failed to create category" });
		}
	}

	async getAll(req, res, next) {
		try {
			const categories = await this.Category.find();
			return res.status(200).json(categories);
		} catch (error) {
			if (next) return next(error);
			return res.status(500).json({ message: "Failed to fetch categories" });
		}
	}

	async getById(req, res, next) {
		try {
			const category = await this.Category.findById(req.params.id);
			if (!category) {
				return res.status(404).json({ message: "Category not found" });
			}
			return res.status(200).json(category);
		} catch (error) {
			if (next) return next(error);
			return res.status(500).json({ message: "Failed to fetch category" });
		}
	}

	async update(req, res, next) {
		try {
			const category = await this.Category.findByIdAndUpdate(
				req.params.id,
				req.body,
				{ new: true, runValidators: true }
			);
			if (!category) {
				return res.status(404).json({ message: "Category not found" });
			}
			return res.status(200).json(category);
		} catch (error) {
			if (next) return next(error);
			return res.status(500).json({ message: "Failed to update category" });
		}
	}

	async remove(req, res, next) {
		try {
			const category = await this.Category.findByIdAndDelete(req.params.id);
			if (!category) {
				return res.status(404).json({ message: "Category not found" });
			}
			return res.status(200).json({ message: "Category deleted successfully" });
		} catch (error) {
			if (next) return next(error);
			return res.status(500).json({ message: "Failed to delete category" });
		}
	}
}

module.exports = new CategoryController();
