require('dotenv').config();
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mymart_fallback_secret';

// Signup Route
router.post('/signup', async (req, res) => {
    const { name, email, password, mobile } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    try {
        const db = getDb();
        const usersCollection = db.collection('users');
        
        // Check if email already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Insert new user
        const result = await usersCollection.insertOne({
            name,
            email,
            password, // For security, password should be hashed (bcrypt) in production
            mobile
        });

        const userId = result.insertedId;
        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({ 
            message: "User created successfully", 
            token, 
            user: { id: userId, name, email } 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const db = getDb();
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            message: "Login successful", 
            token, 
            user: { id: user._id, name: user.name, email: user.email } 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
