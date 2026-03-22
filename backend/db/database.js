const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'mymart.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT,
            category TEXT,
            description TEXT
        )`);

        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            mobile TEXT
        )`);

        // Create Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total REAL,
            shipping_address TEXT,
            payment_method TEXT,
            status TEXT DEFAULT 'Pending'
        )`);

        // Create Order Items Table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        )`);

        // Seed Products if empty
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
            if (row.count === 0) {
                console.log("Seeding products...");
                const products = [
                    { id: 1, name: "Laptop", price: 63969, image: "/media/laptop.png", category: "Electronics", description: "High-performance laptop for work and gaming." },
                    { id: 2, name: "Mobiles", price: 17999, image: "/media/mobile.png", category: "Electronics", description: "Latest smartphone with advanced features." },
                    { id: 3, name: "Formal Shirts", price: 999, image: "/media/shirt.webp", category: "Fashion", description: "Premium quality formal shirts for professionals." },
                    { id: 4, name: "Formal Pants", price: 1999, image: "/media/paint.jpg", category: "Fashion", description: "Comfortable and stylish formal pants." },
                    { id: 5, name: "Tshirts", price: 299, image: "/media/tshirt.jpg", category: "Fashion", description: "Casual t-shirts for everyday wear." },
                    { id: 6, name: "Short Pants", price: 499, image: "/media/shorts.webp", category: "Fashion", description: "Comfortable shorts for summer." },
                    { id: 7, name: "Camera", price: 12999, image: "/media/camera.png", category: "Electronics", description: "Professional camera for photography enthusiasts." },
                    { id: 8, name: "Earbuds", price: 999, image: "/media/earbuds.png", category: "Electronics", description: "Wireless earbuds with excellent sound quality." },
                    { id: 9, name: "Racing Car", price: 4999, image: "/media/toys.png", category: "Toys", description: "Remote controlled racing car for kids." },
                    { id: 10, name: "Puzzle", price: 799, image: "/media/sports.png", category: "Toys", description: "Educational puzzle for children." },
                    { id: 11, name: "Musical Instruments", price: 1299, image: "/media/musicaltoy.png", category: "Toys", description: "Set of musical instruments for kids." },
                    { id: 12, name: "Pen", price: 799, image: "/media/pen.png", category: "Stationery", description: "Premium quality pen for writing." },
                    { id: 13, name: "Honey", price: 499, image: "/media/honey.png", category: "Food", description: "Pure natural honey with health benefits." },
                    { id: 14, name: "Makeup Kit", price: 7999, image: "/media/beauty.jpg", category: "Beauty", description: "Complete makeup kit with all essentials." },
                    { id: 15, name: "Almonds", price: 499, image: "/media/food.webp", category: "Food", description: "Premium quality almonds, rich in nutrients." },
                    { id: 16, name: "Protein", price: 799, image: "/media/healthCare.png", category: "Health", description: "High-quality protein supplement for fitness." },
                    { id: 17, name: "Ladies Kurti", price: 999, image: "/media/dress.webp", category: "Fashion", description: "Elegant kurti for women." },
                    { id: 18, name: "Tablets", price: 29999, image: "/media/tablets.png", category: "Electronics", description: "Latest tablet with high-resolution display." },
                    { id: 19, name: "TV", price: 12999, image: "/media/tv.png", category: "Electronics", description: "Smart TV with streaming capabilities." },
                    { id: 20, name: "Appliances", price: 49999, image: "/media/applinces.webp", category: "Home", description: "Home appliances for modern living." },
                    { id: 21, name: "Furniture", price: 40999, image: "/media/furniture.jpeg", category: "Home", description: "Modern furniture for your home." },
                    { id: 22, name: "Cricket Kit", price: 17999, image: "/media/kit.png", category: "Sports", description: "Complete cricket kit for players." },
                    { id: 23, name: "Bluetooth Headphone", price: 699, image: "/media/bluetoothheadphone.png", category: "Electronics", description: "Wireless headphones with noise cancellation." },
                    { id: 24, name: "Speaker", price: 7999, image: "/media/speaker.png", category: "Electronics", description: "High-quality speaker for immersive sound." },
                    { id: 25, name: "Cold Drinks", price: 99, image: "/media/drinks.jpg", category: "Food", description: "Refreshing cold drinks for summer." },
                    { id: 26, name: "Running Shoes", price: 999, image: "/media/shoe.webp", category: "Fashion", description: "Comfortable running shoes for athletes." },
                    { id: 27, name: "Hair Care Kit", price: 299, image: "/media/haircare.png", category: "Beauty", description: "Complete hair care kit for healthy hair." },
                    { id: 28, name: "Slipper", price: 399, image: "/media/slipper.png", category: "Fashion", description: "Comfortable slippers for home use." },
                    { id: 29, name: "Tooth Paste", price: 49, image: "/media/paste.png", category: "Health", description: "Fluoride toothpaste for dental care." },
                    { id: 30, name: "Fortune Oil", price: 399, image: "/media/oil.png", category: "Food", description: "Healthy cooking oil for daily use." },
                    { id: 31, name: "Maggie", price: 29, image: "/media/maggie.png", category: "Food", description: "Instant noodles for quick meals." },
                    { id: 32, name: "Harpic", price: 99, image: "/media/harpic.png", category: "Home", description: "Toilet cleaner for hygiene." }
                ];
                
                const stmt = db.prepare("INSERT INTO products (id, name, price, image, category, description) VALUES (?, ?, ?, ?, ?, ?)");
                products.forEach(p => {
                    stmt.run(p.id, p.name, p.price, p.image, p.category, p.description);
                });
                stmt.finalize();
                console.log("Seeding complete.");
            }
        });
    });
}

module.exports = db;
