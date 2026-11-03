const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
	{
		productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'manage-swiggy-food',
			required: true,
		},
		name: { type: String, required: true, trim: true },
		quantity: { type: Number, required: true, min: 1 },
		price: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const orderSchema = new mongoose.Schema(
	{
		name: { type: String, trim: true },
		description: { type: String, trim: true },
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'manage-swiggy-user',
			required: true,
		},
		restaurantId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'manage-swiggy-restaurant',
			required: true,
		},
		items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, 'Order must contain at least one item'] },
		totalAmount: { type: Number, required: true, min: 0 },
		deliveryAddress: { type: String, required: true, trim: true },
		status: {
			type: String,
			enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
			default: 'pending',
		},
		paymentMethod: {
			type: String,
			enum: ['cash', 'card', 'online'],
			required: true,
		},
		paymentStatus: {
			type: String,
			enum: ['pending', 'paid', 'failed', 'refunded'],
			default: 'pending',
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model('manage-swiggy-order', orderSchema);
module.exports = Order
