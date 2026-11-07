const Order = require('../model/order.model');
const Food = require('../model/food.model'); 
const mongoose = require('mongoose');


const STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled', 'rejected'],          
    confirmed: ['preparing', 'cancelled'],                      
    preparing: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
    rejected: [],
};


const ROLE_PERMISSIONS = {
    user: { confirmed: [], rejected: [], cancelled: ['user'] },
    restaurant_owner: { confirmed: ['restaurant'], rejected: ['restaurant'], cancelled: ['restaurant'] },
    admin: { confirmed: ['admin'], rejected: ['admin'], cancelled: ['admin', 'user', 'restaurant'] },
};

class OrderController {
    
    async create(req, res) {
        try {
            const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: 'Order must contain at least one item' });
            }

            // Fetch real prices — never trust client prices
            const productIds = items.map((i) => i.productId);
            const products = await Food.find({ _id: { $in: productIds } });
            const productMap = new Map(products.map((p) => [p._id.toString(), p]));

            const orderItems = [];
            let totalAmount = 0;
            for (const item of items) {
                const product = productMap.get(String(item.productId));
                if (!product) return res.status(400).json({ message: `Product ${item.productId} not found` });
                const qty = Number(item.quantity);
                if (!Number.isInteger(qty) || qty < 1) {
                    return res.status(400).json({ message: 'Quantity must be a positive integer' });
                }
                orderItems.push({ productId: product._id, name: product.name, quantity: qty, price: product.price });
                totalAmount += product.price * qty;
            }

            const order = await Order.create({
                userId: req.user.id, // from auth token, never from body
                restaurantId,
                items: orderItems,
                totalAmount,
                deliveryAddress,
                paymentMethod,
            });
            return res.status(201).json(order);
        } catch (error) {
            return this.handleError(res, error, 'Failed to create order');
        }
    }

   
    async getAll(req, res) {
        try {
            const filter = {};
            if (req.user.role === 'user') {
                filter.userId = req.user.id; // ownership validation
            } else if (req.user.role === 'restaurant_owner') {
                if (!req.user.restaurantId) return res.status(403).json({ message: 'No restaurant linked to your account' });
                filter.restaurantId = req.user.restaurantId; // restaurant ownership validation
            }
            // admin: no filter

            const { status, page = 1, limit = 20 } = req.query;
            if (status) filter.status = status;

            const orders = await Order.find(filter)
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit))
                .populate('userId', 'name email');
            return res.status(200).json(orders);
        } catch (error) {
            return this.handleError(res, error, 'Failed to fetch orders');
        }
    }

    
    async getById(req, res) {
        try {
            const order = await Order.findById(req.params.id).populate('userId', 'name email');
            if (!order) return res.status(404).json({ message: 'Order not found' });

            const canView =
                req.user.role === 'admin' ||
                order.userId._id.toString() === req.user.id ||
                (req.user.role === 'restaurant_owner' &&
                    order.restaurantId.toString() === String(req.user.restaurantId));
            if (!canView) return res.status(403).json({ message: 'Not allowed to view this order' });

            return res.status(200).json(order);
        } catch (error) {
            return this.handleError(res, error, 'Failed to fetch order');
        }
    }

    
    async updateStatus(req, res) {
        try {
            const { status, reason } = req.body;
            if (!status) return res.status(400).json({ message: 'Status is required' });

            const order = await Order.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Order not found' });

            // 1. Is this transition legal for the current status?
            if (!STATUS_TRANSITIONS[order.status].includes(status)) {
                return res.status(400).json({ message: `Cannot move order from '${order.status}' to '${status}'` });
            }

            // 2. Is this role allowed to perform it?
            const allowedActors = ROLE_PERMISSIONS[req.user.role]?.[status] || [];
            if (!allowedActors.length) {
                return res.status(403).json({ message: 'You are not allowed to set this status' });
            }

            // 3. Ownership validation
            const isOrderUser = order.userId.toString() === req.user.id;
            const isRestaurantOwner =
                req.user.role === 'restaurant_owner' &&
                order.restaurantId.toString() === String(req.user.restaurantId);
            const isAdmin = req.user.role === 'admin';

            if (status === 'cancelled') {
                // user can cancel own pending/confirmed order; owner cancels own restaurant's; admin any
                if (!((isOrderUser && allowedActors.includes('user')) || (isRestaurantOwner && allowedActors.includes('restaurant')) || (isAdmin && allowedActors.includes('admin')))) {
                    return res.status(403).json({ message: 'Not allowed to cancel this order' });
                }
                order.cancelledBy = isOrderUser ? 'user' : isRestaurantOwner ? 'restaurant' : 'admin';
                order.cancelReason = reason;
            } else {
                // confirm/preparing/reject etc. — owner of that restaurant (or admin)
                if (!(isRestaurantOwner || isAdmin)) {
                    return res.status(403).json({ message: 'Only the restaurant owner or admin can update this order' });
                }
                if (status === 'rejected') order.cancelReason = reason;
            }

            order.status = status;
            await order.save();
            return res.status(200).json(order);
        } catch (error) {
            return this.handleError(res, error, 'Failed to update order status');
        }
    }

    // Centralized error handling
    handleError(res, error, fallbackMessage) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (error instanceof mongoose.Error.CastError) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate entry' });
        }
        console.error(error);
        return res.status(500).json({ message: fallbackMessage });
    }
}

module.exports = new OrderController();