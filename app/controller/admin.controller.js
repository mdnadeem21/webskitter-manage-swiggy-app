const User = require('../model/user.model');
const Restaurant = require('../model/restaurant.model');
const Order = require('../model/order.model');
const Category = require('../model/category.model');
const mongoose = require('mongoose');

class AdminController {
    // ─────────── USERS ───────────

    async getUsers(req, res) {
        try {
            const { search, page = 1, limit = 20 } = req.query;
            const filter = { role: { $ne: 'admin' } }; // never expose fellow admins
            if (search && search.trim()) {
                filter.$or = [
                    { name: { $regex: search.trim(), $options: 'i' } },
                    { email: { $regex: search.trim(), $options: 'i' } },
                ];
            }
            const total = await User.countDocuments(filter);
            const users = await User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));
            return res.status(200).json({ users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch users' });
        }
    }

    
    async toggleBlock(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (user.role === 'admin') return res.status(403).json({ message: 'Cannot block an admin' });

            user.isBlocked = !user.isBlocked;
            await user.save();
            return res.status(200).json({
                message: user.isBlocked ? 'User blocked' : 'User unblocked',
                userId: user._id,
                isBlocked: user.isBlocked,
            });
        } catch (error) {
            return this.handleError(res, error, 'Failed to update user status');
        }
    }

    // ─────────── RESTAURANTS & ORDERS (view-only, with filters) ───────────

    
    async getRestaurants(req, res) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const total = await Restaurant.countDocuments({});
            const restaurants = await Restaurant.find({})
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));
            return res.status(200).json({ restaurants, total });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch restaurants' });
        }
    }

    
    async getOrders(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const filter = {};
            if (status) filter.status = status;

            const total = await Order.countDocuments(filter);
            const orders = await Order.find(filter)
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit))
                .populate('userId', 'name email')
                .populate('restaurantId', 'name');
            return res.status(200).json({ orders, total });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch orders' });
        }
    }

    // ─────────── CATEGORIES (manage) ───────────

    
    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            if (!name || !name.trim()) return res.status(400).json({ message: 'Category name is required' });

            const exists = await Category.findOne({ name: name.trim().toLowerCase() });
            if (exists) return res.status(400).json({ message: 'Category already exists' }); // 11000 race-safe check

            const category = await Category.create({ name: name.trim(), description });
            return res.status(201).json(category);
        } catch (error) {
            return this.handleError(res, error, 'Failed to create category');
        }
    }

    
    async updateCategory(req, res) {
        try {
            const { name, description } = req.body;
            const update = {};
            if (name !== undefined) update.name = name.trim();
            if (description !== undefined) update.description = description;

            const category = await Category.findByIdAndUpdate(req.params.id, update, {
                new: true,
                runValidators: true,
            });
            if (!category) return res.status(404).json({ message: 'Category not found' });
            return res.status(200).json(category);
        } catch (error) {
            return this.handleError(res, error, 'Failed to update category');
        }
    }

    
    async deleteCategory(req, res) {
        try {
            // Guard: don't delete a category that foods still reference
            const Food = require('../model/food.model');
            const inUse = await Food.countDocuments({ category: req.params.id });
            if (inUse > 0) {
                return res.status(400).json({ message: `Cannot delete: ${inUse} food item(s) use this category` });
            }

            const category = await Category.findByIdAndDelete(req.params.id);
            if (!category) return res.status(404).json({ message: 'Category not found' });
            return res.status(200).json({ message: 'Category deleted' });
        } catch (error) {
            return this.handleError(res, error, 'Failed to delete category');
        }
    }

    // ─────────── STATISTICS ───────────

    // GET /api/admin/stats
    async getStats(req, res) {
        try {
            const stats = await Order.aggregate([
                // 1. Only count revenue from orders that actually happened
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: {
                            $sum: {
                                $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalAmount', 0],
                            },
                        },
                        cancelledOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
                        },
                        deliveredOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
                        },
                    },
                },
                { $project: { _id: 0 } },
            ]);

            const [userCount, restaurantCount, pendingCount] = await Promise.all([
                User.countDocuments({ role: { $ne: 'admin' } }),
                Restaurant.countDocuments({}),
                Order.countDocuments({ status: 'pending' }),
            ]);

            const s = stats[0] || { totalOrders: 0, totalRevenue: 0, cancelledOrders: 0, deliveredOrders: 0 };

            return res.status(200).json({
                platform: {
                    totalUsers: userCount,
                    totalRestaurants: restaurantCount,
                },
                orders: {
                    totalOrders: s.totalOrders,
                    pendingOrders: pendingCount,
                    deliveredOrders: s.deliveredOrders,
                    cancelledOrders: s.cancelledOrders,
                    totalRevenue: s.totalRevenue,
                    avgOrderValue: s.totalOrders ? +(s.totalRevenue / s.totalOrders).toFixed(2) : 0,
                },
            });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to compute statistics' });
        }
    }

    handleError(res, error, fallback) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (error instanceof mongoose.Error.CastError) {
            return res.status(404).json({ message: 'Not found' });
        }
        console.error(error);
        return res.status(500).json({ message: fallback });
    }
}

module.exports = new AdminController();