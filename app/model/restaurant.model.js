const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			default: '',
		},
		image: {
			type: String,
			default: '',
		},
		cuisines: {
			type: [String],
			default: [],
		},
		address: {
			type: String,
			required: true,
			trim: true,
		},
		rating: {
			type: Number,
			min: 0,
			max: 5,
			default: 0,
		},
		isOpen: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const Restaurant = mongoose.model('manage-swiggy-restaurant', restaurantSchema);
module.exports = Restaurant
