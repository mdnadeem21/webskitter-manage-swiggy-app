const Cart = require('../model/cart.model');
const Food = require('..//model/food.model');
const mongoose = require('mongoose');

class CartController {
    
    async getOrCreateCart(userId) {
        let cart = await Cart.findOne({ userId });
        if (!cart) cart = await Cart.create({ userId, items: [] });
        return cart;
    }

    
    async addItem(req, res) {
        try {
            const { foodId, quantity = 1 } = req.body;
            if (!foodId) return res.status(400).json({ message: 'foodId is required' });

            const food = await Food.findById(foodId);
            if (!food) return res.status(404).json({ message: 'Food not found' });

            const cart = await this.getOrCreateCart(req.user.id); // cart belongs to auth user

            // Rule: one restaurant per cart (like real Swiggy/Zomato)
            if (cart.restaurantId && cart.restaurantId.toString() !== food.restaurant.toString()) {
                return res.status(400).json({ message: 'Cart already has items from another restaurant. Clear cart first.' });
            }

            const existing = cart.items.find((i) => i.foodId.toString() === foodId);
            if (existing) {
                existing.quantity += Number(quantity);
                if (existing.quantity > 20) return res.status(400).json({ message: 'Max 20 per item' });
            } else {
                cart.items.push({ foodId: food._id, name: food.name, price: food.price, isVeg: food.isVeg, quantity: Number(quantity) });
            }
            cart.restaurantId = food.restaurantId;

            await cart.save();
            return res.status(200).json(cart);
        } catch (error) {
            return this.handleError(res, error, 'Failed to add item');
        }
    }

    
    async updateQuantity(req, res) {
        try {
            const { action } = req.body;
            if (!['increase', 'decrease'].includes(action)) {
                return res.status(400).json({ message: 'action must be increase or decrease' });
            }

            const cart = await Cart.findOne({ userId: req.user.id });
            if (!cart) return res.status(404).json({ message: 'Cart is empty' });

            const item = cart.items.find((i) => i.foodId.toString() === req.params.foodId);
            if (!item) return res.status(404).json({ message: 'Item not in cart' });

            if (action === 'increase') item.quantity += 1;
            else {
                item.quantity -= 1;
                if (item.quantity < 1) cart.items.pull(item); // decrease from 1 → remove
            }

            if (cart.items.length === 0) cart.restaurantId = undefined;
            await cart.save();
            return res.status(200).json(cart);
        } catch (error) {
            return this.handleError(res, error, 'Failed to update quantity');
        }
    }

    
    async removeItem(req, res) {
        try {
            const cart = await Cart.findOne({ userId: req.user.id });
            if (!cart) return res.status(404).json({ message: 'Cart not found' });

            const item = cart.items.find((i) => i.foodId.toString() === req.params.foodId);
            if (!item) return res.status(404).json({ message: 'Item not in cart' });

            cart.items.pull(item);
            if (cart.items.length === 0) cart.restaurantId = undefined;
            await cart.save();
            return res.status(200).json(cart);
        } catch (error) {
            return this.handleError(res, error, 'Failed to remove item');
        }
    }

    
    async getCart(req, res) {
        try {
            const cart = await Cart.findOne({ userId: req.user.id });
            if (!cart) return res.status(200).json({ items: [], totalAmount: 0 }); // empty cart ≠ error
            return res.status(200).json(cart);
        } catch (error) {
            return this.handleError(res, error, 'Failed to fetch cart');
        }
    }

    
    async clearCart(req, res) {
        try {
            const cart = await Cart.findOne({ userId: req.user.id });
            if (cart) {
                cart.items = [];
                cart.restaurantId = undefined;
                await cart.save();
            }
            return res.status(200).json({ message: 'Cart cleared' });
        } catch (error) {
            return this.handleError(res, error, 'Failed to clear cart');
        }
    }

    handleError(res, error, fallback) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Invalid id' });
        }
        console.error(error);
        return res.status(500).json({ message: fallback });
    }
}

module.exports = new CartController();