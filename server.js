require('dotenv').config(); // Load .env variables first
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./backend/db/database');

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/products', require('./backend/routes/products'));
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/orders', require('./backend/routes/orders'));

// Root: Redirect to homepage
app.get('/', (req, res) => {
    res.redirect('/frontend/homePage.html');
});

// Start Server
const startServer = async () => {
    let dbConnected = false;
    let retries = 3;
    
    while (retries > 0 && !dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
            console.log('✅ Database connection successful');
        } catch (err) {
            retries--;
            if (retries > 0) {
                console.log(`⏳ Retrying database connection... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('❌ Failed to connect to MongoDB after 3 attempts');
                console.error('⚠️  Check that MONGO_URI environment variable is set correctly');
                process.exit(1);
            }
        }
    }

    app.listen(PORT, () => {
        console.log('==================================');
        console.log(`  ✅ myMart Server Running!`);
        console.log(`  URL: http://localhost:${PORT}`);
        console.log(`  Opens: http://localhost:${PORT}/frontend/homePage.html`);
        console.log('==================================');
    });
};

startServer();
