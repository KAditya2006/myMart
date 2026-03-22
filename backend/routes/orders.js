const express = require('express');
const router = express.Router();
const db = require('../db/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mymart_super_secret_key_2025';

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
router.get('/', authenticate, (req, res) => {
    const userId = req.user.id;

    db.all(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
        [userId],
        (err, orders) => {
            if (err) return res.status(500).json({ error: err.message });

            if (orders.length === 0) {
                return res.json({ orders: [] });
            }

            // For each order, get its items joined with product names
            let pending = orders.length;
            const enriched = [];

            orders.forEach((order, i) => {
                db.all(
                    `SELECT oi.quantity, oi.price, p.name, p.image, p.category
                     FROM order_items oi
                     LEFT JOIN products p ON oi.product_id = p.id
                     WHERE oi.order_id = ?`,
                    [order.id],
                    (err2, items) => {
                        enriched[i] = {
                            ...order,
                            shipping_address: JSON.parse(order.shipping_address || '{}'),
                            items: items || []
                        };
                        pending--;
                        if (pending === 0) {
                            res.json({ orders: enriched });
                        }
                    }
                );
            });
        }
    );
});

// GET /api/orders/:id — fetch a single order (must belong to user)
router.get('/:id', authenticate, (req, res) => {
    db.get(
        "SELECT * FROM orders WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id],
        (err, order) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!order) return res.status(404).json({ error: 'Order not found' });

            db.all(
                `SELECT oi.quantity, oi.price, p.name, p.image, p.category
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id],
                (err2, items) => {
                    res.json({
                        order: {
                            ...order,
                            shipping_address: JSON.parse(order.shipping_address || '{}'),
                            items: items || []
                        }
                    });
                }
            );
        }
    );
});

// POST /api/orders — create a new order (no auth required, works for guests too)
router.post('/', (req, res) => {
    const { userId, items, total, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0 || !total || !shippingAddress || !paymentMethod) {
        return res.status(400).json({ error: "Missing required order information" });
    }

    db.serialize(() => {
        db.run(
            "INSERT INTO orders (user_id, total, shipping_address, payment_method) VALUES (?, ?, ?, ?)",
            [userId || null, total, JSON.stringify(shippingAddress), paymentMethod],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                const orderId = this.lastID;

                const stmt = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
                items.forEach(item => {
                    stmt.run(orderId, item.id, item.quantity, item.price);
                });
                stmt.finalize();

                res.status(201).json({ message: "Order placed successfully", orderId });
            }
        );
    });
});

module.exports = router;
