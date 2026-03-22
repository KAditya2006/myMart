require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mymart_fallback_secret';

// Signup Route
router.post('/signup', (req, res) => {
    const { name, email, password, mobile } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }

    db.run(
        "INSERT INTO users (name, email, password, mobile) VALUES (?, ?, ?, ?)",
        [name, email, password, mobile], // For security, password should be hashed (bcrypt) in production
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Email already exists" });
                }
                return res.status(500).json({ error: err.message });
            }
            
            const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({ 
                message: "User created successfully", 
                token, 
                user: { id: this.lastID, name, email } 
            });
        }
    );
});

// Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            message: "Login successful", 
            token, 
            user: { id: user.id, name: user.name, email: user.email } 
        });
    });
});

module.exports = router;
