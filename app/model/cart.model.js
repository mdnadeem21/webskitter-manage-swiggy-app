const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
    {
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'manage-swiggy-food',
            required: true,
        },
        name: { type: String, required: true }, // snapshot
        price: { type: Number, required: true, min: 0 }, // snapshot
        isVeg: { type: Boolean, default: true },
        quantity: { type: Number, required: true, min: 1, max: 20 },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'manage-swiggy-user',
            required: true,
            unique: true, // one active cart per user
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'manage-swiggy-restaurant',
        },
        items: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true }
);

// Total price
cartSchema.virtual('totalAmount').get(function () {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Must be set for virtuals to appear in res.json()
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('manage-swiggy-cart', cartSchema);
module.exports = Cart;