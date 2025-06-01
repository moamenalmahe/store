const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../data/orders.json');

// Helper function to read orders file
async function readOrdersFile() {
    try {
        const data = await fs.readFile(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { orders: [] };
        }
        throw error;
    }
}

// Helper function to write orders file
async function writeOrdersFile(data) {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2));
}

// Get all orders (with role-based filtering)
router.get('/', async (req, res) => {
    try {
        const data = await readOrdersFile();
        
        // Filter orders based on user role
        let filteredOrders = data.orders;
        if (req.user.role === 'user') {
            // Regular users can only see their own orders
            filteredOrders = data.orders.filter(order => order.userId === req.user.id);
        }
        // Admins and superadmins can see all orders

        res.json(filteredOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const { products, totalAmount } = req.body;

        if (!products || !totalAmount) {
            return res.status(400).json({ error: 'Products and total amount are required' });
        }

        const data = await readOrdersFile();

        const newOrder = {
            id: Date.now().toString(),
            userId: req.user.id,
            username: req.user.username,
            products,
            totalAmount,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        data.orders.push(newOrder);
        await writeOrdersFile(data);

        res.json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status (admin only)
router.post('/update-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ error: 'Order ID and status are required' });
        }

        // Only admins and superadmins can update order status
        if (req.user.role === 'user') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const data = await readOrdersFile();
        const orderIndex = data.orders.findIndex(order => order.id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status
        data.orders[orderIndex].status = status;
        await writeOrdersFile(data);

        res.json({ 
            message: 'Order status updated successfully',
            order: data.orders[orderIndex]
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router; 