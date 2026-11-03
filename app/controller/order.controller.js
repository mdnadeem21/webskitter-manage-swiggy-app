const Order = require("../model/order.model")
class OrderController {
	

    // need to imporve this controller
	async create(req, res) {
		try {
            const {} = req.body
			const order = await Order.create(req.body);
			return res.status(201).json(order);
		} catch (error) {
			return res.status(500).json({ message: 'Failed to create order' });
		}
	}

	async getAll(req, res) {
		try {
			const orders = await Order.find();
			return res.status(200).json(orders);
		} catch (error) {
			return res.status(500).json({ message: 'Failed to fetch orders' });
		}
	}

	async getById(req, res) {
		try {
			const order = await Order.findById(req.params.id);
			if (!order) {
				return res.status(404).json({ message: 'Order not found' });
			}
			return res.status(200).json(order);
		} catch (error) {
			return res.status(500).json({ message: 'Failed to fetch order' });
		}
	}

	async update(req, res) {
		try {
			const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});
			if (!order) {
				return res.status(404).json({ message: 'Order not found' });
			}
			return res.status(200).json(order);
		} catch (error) {
			return res.status(500).json({ message: 'Failed to update order' });
		}
	}

	async delete(req, res) {
		try {
			const order = await Order.findByIdAndDelete(req.params.id);
			if (!order) {
				return res.status(404).json({ message: 'Order not found' });
			}
			return res.status(200).json({ message: 'Order deleted successfully' });
		} catch (error) {
			return res.status(500).json({ message: 'Failed to delete order' });
		}
	}
}

module.exports = new OrderController();
