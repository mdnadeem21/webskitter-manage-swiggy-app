const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
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
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		image: {
			type: String,
			trim: true,
			default: '',
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		restaurant: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'manage-swiggy-restaurant',
			required: true,
		},
		isAvailable: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const Food= mongoose.model('manage-swiggy-food', foodSchema);
module.exports = Food
