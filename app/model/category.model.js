const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			default: '',
		},
	},
	{ timestamps: true }
);

const Category = mongoose.model('manage-swiggy-category', categorySchema);
module.exports = Category
