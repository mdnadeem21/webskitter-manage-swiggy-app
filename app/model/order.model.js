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
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'manage-swiggy-user',
            required: true,
            index: true,
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'manage-swiggy-restaurant',
            required: true,
            index: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: { validator: (v) => v.length > 0, message: 'Order must contain at least one item' },
        },
        totalAmount: { type: Number, required: true, min: 0 },
        deliveryAddress: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'rejected'],
            default: 'pending',
            index: true,
        },
        paymentMethod: { type: String, enum: ['cash', 'card', 'online'], required: true },
        paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
        cancelReason: { type: String, trim: true },        
        cancelledBy: { type: String, enum: ['user', 'restaurant', 'admin'] },
    },
    { timestamps: true }
);

orderSchema.index({ restaurantId: 1, status: 1 }); 

const Order = mongoose.model('manage-swiggy-order', orderSchema);
module.exports = Order;
