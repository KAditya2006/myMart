const express = require('express');
const router = express.Router();
const { getDb, ObjectId } = require('../db/database');

// Get all products
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const productsCollection = db.collection('products');
        const products = await productsCollection.find({}).toArray();
        res.json({ products });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const productsCollection = db.collection('products');
        const productId = parseInt(req.params.id);
        const product = await productsCollection.findOne({ _id: productId });
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ product });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
