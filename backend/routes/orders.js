require('dotenv').config();
const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../db/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mymart_fallback_secret';

// JWT Auth middleware
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// GET /api/orders — fetch all orders for the logged-in user
router.get('/', authenticate, async (req, res) => {
    const userId = req.user.id;

    try {
        const db = getDb();
        const ordersCollection = db.collection('orders');
        const orderItemsCollection = db.collection('order_items');
        const productsCollection = db.collection('products');

        // Find all orders for the user
        const orders = await ordersCollection
            .find({ user_id: new ObjectId(userId) })
            .sort({ _id: -1 })
            .toArray();

        if (orders.length === 0) {
            return res.json({ orders: [] });
        }

        // Enrich orders with items and product details
        const enriched = await Promise.all(
            orders.map(async (order) => {
                const items = await orderItemsCollection
                    .find({ order_id: order._id })
                    .toArray();

                // Get product details for each item
                const enrichedItems = await Promise.all(
                    items.map(async (item) => {
                        const product = await productsCollection.findOne({ _id: item.product_id });
                        return {
                            quantity: item.quantity,
                            price: item.price,
                            name: product?.name,
                            image: product?.image,
                            category: product?.category
                        };
                    })
                );

                return {
                    ...order,
                    shipping_address: typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address) 
                        : order.shipping_address || {},
                    items: enrichedItems
                };
            })
        );

        res.json({ orders: enriched });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/:id — fetch a single order (must belong to user)
router.get('/:id', authenticate, async (req, res) => {
    try {
        const db = getDb();
        const ordersCollection = db.collection('orders');
        const orderItemsCollection = db.collection('order_items');
        const productsCollection = db.collection('products');

        const orderId = new ObjectId(req.params.id);
        const userId = new ObjectId(req.user.id);

        // Find the order
        const order = await ordersCollection.findOne({ _id: orderId, user_id: userId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Find order items
        const items = await orderItemsCollection
            .find({ order_id: orderId })
            .toArray();

        // Get product details for each item
        const enrichedItems = await Promise.all(
            items.map(async (item) => {
                const product = await productsCollection.findOne({ _id: item.product_id });
                return {
                    quantity: item.quantity,
                    price: item.price,
                    name: product?.name,
                    image: product?.image,
                    category: product?.category
                };
            })
        );

        res.json({
            order: {
                ...order,
                shipping_address: typeof order.shipping_address === 'string' 
                    ? JSON.parse(order.shipping_address) 
                    : order.shipping_address || {},
                items: enrichedItems
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/orders — create a new order (no auth required, works for guests too)
router.post('/', async (req, res) => {
    const { userId, items, total, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0 || !total || !shippingAddress || !paymentMethod) {
        return res.status(400).json({ error: "Missing required order information" });
    }

    try {
        const db = getDb();
        const ordersCollection = db.collection('orders');
        const orderItemsCollection = db.collection('order_items');

        // Create the order
        const orderResult = await ordersCollection.insertOne({
            user_id: userId ? new ObjectId(userId) : null,
            total,
            shipping_address: typeof shippingAddress === 'string' 
                ? shippingAddress 
                : JSON.stringify(shippingAddress),
            payment_method: paymentMethod,
            status: 'Pending'
        });

        const orderId = orderResult.insertedId;

        // Insert order items
        const orderItems = items.map(item => ({
            order_id: orderId,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        }));

        await orderItemsCollection.insertMany(orderItems);

        res.status(201).json({ 
            message: "Order placed successfully", 
            orderId 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
