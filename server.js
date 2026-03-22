require('dotenv').config(); // Load .env variables first
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./backend/db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the entire project root as static directory
// This allows /frontend/homePage.html to resolve correctly
app.use(express.static(path.join(__dirname)));

// Aliases so HTML href="/css/..." and src="/js/..." work without /frontend/ prefix
app.use('/css', express.static(path.join(__dirname, 'frontend', 'css')));
app.use('/js', express.static(path.join(__dirname, 'frontend', 'js')));

// Expose /media pointing to frontend/media (images, logo, product pics)
app.use('/media', express.static(path.join(__dirname, 'frontend', 'media')));

// API Routes
app.use('/api/products', require('./backend/routes/products'));
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/orders', require('./backend/routes/orders'));

// Root: Redirect to homepage
app.get('/', (req, res) => {
    res.redirect('/frontend/homePage.html');
});

// Start Server
app.listen(PORT, () => {
    console.log('==================================');
    console.log(`  myMart Server Running!`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Opens: http://localhost:${PORT}/frontend/homePage.html`);
    console.log('==================================');
});
