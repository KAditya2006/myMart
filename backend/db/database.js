const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'mymart_db';

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined. Set MONGO_URI in .env or Render environment variables.');
    process.exit(1);
}

let db = null;
let client = null;
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return db;
    
    try {
        console.log('🔄 Connecting to MongoDB...');
        client = new MongoClient(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        await client.connect();
        db = client.db(DB_NAME);
        isConnected = true;
        console.log('✅ Connected to MongoDB:', MONGO_URI.split('@')[1] || 'local');
        await initDb();
        return db;
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        console.error('💡 Make sure MONGO_URI environment variable is set');
        throw err;
    }
};

const initDb = async () => {
    try {
        // Create collections if they don't exist
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        if (!collectionNames.includes('products')) {
            await db.createCollection('products');
            console.log('Created products collection');
        }

        if (!collectionNames.includes('users')) {
            await db.createCollection('users');
            console.log('Created users collection');
        }

        if (!collectionNames.includes('orders')) {
            await db.createCollection('orders');
            console.log('Created orders collection');
        }

        if (!collectionNames.includes('order_items')) {
            await db.createCollection('order_items');
            console.log('Created order_items collection');
        }

        // Create indexes for better query performance
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('orders').createIndex({ user_id: 1 });
        await db.collection('order_items').createIndex({ order_id: 1 });

        // Seed Products if empty
        const productCount = await db.collection('products').countDocuments();
        if (productCount === 0) {
            console.log('Seeding products...');
            const products = [
                { _id: 1, name: "Laptop", price: 63969, image: "/media/laptop.png", category: "Electronics", description: "High-performance laptop for work and gaming." },
                { _id: 2, name: "Mobiles", price: 17999, image: "/media/mobile.png", category: "Electronics", description: "Latest smartphone with advanced features." },
                { _id: 3, name: "Formal Shirts", price: 999, image: "/media/shirt.webp", category: "Fashion", description: "Premium quality formal shirts for professionals." },
                { _id: 4, name: "Formal Pants", price: 1999, image: "/media/paint.jpg", category: "Fashion", description: "Comfortable and stylish formal pants." },
                { _id: 5, name: "Tshirts", price: 299, image: "/media/tshirt.jpg", category: "Fashion", description: "Casual t-shirts for everyday wear." },
                { _id: 6, name: "Short Pants", price: 499, image: "/media/shorts.webp", category: "Fashion", description: "Comfortable shorts for summer." },
                { _id: 7, name: "Camera", price: 12999, image: "/media/camera.png", category: "Electronics", description: "Professional camera for photography enthusiasts." },
                { _id: 8, name: "Earbuds", price: 999, image: "/media/earbuds.png", category: "Electronics", description: "Wireless earbuds with excellent sound quality." },
                { _id: 9, name: "Racing Car", price: 4999, image: "/media/toys.png", category: "Toys", description: "Remote controlled racing car for kids." },
                { _id: 10, name: "Puzzle", price: 799, image: "/media/sports.png", category: "Toys", description: "Educational puzzle for children." },
                { _id: 11, name: "Musical Instruments", price: 1299, image: "/media/musicaltoy.png", category: "Toys", description: "Set of musical instruments for kids." },
                { _id: 12, name: "Pen", price: 799, image: "/media/pen.png", category: "Stationery", description: "Premium quality pen for writing." },
                { _id: 13, name: "Honey", price: 499, image: "/media/honey.png", category: "Food", description: "Pure natural honey with health benefits." },
                { _id: 14, name: "Makeup Kit", price: 7999, image: "/media/beauty.jpg", category: "Beauty", description: "Complete makeup kit with all essentials." },
                { _id: 15, name: "Almonds", price: 499, image: "/media/food.webp", category: "Food", description: "Premium quality almonds, rich in nutrients." },
                { _id: 16, name: "Protein", price: 799, image: "/media/healthCare.png", category: "Health", description: "High-quality protein supplement for fitness." },
                { _id: 17, name: "Ladies Kurti", price: 999, image: "/media/dress.webp", category: "Fashion", description: "Elegant kurti for women." },
                { _id: 18, name: "Tablets", price: 29999, image: "/media/tablets.png", category: "Electronics", description: "Latest tablet with high-resolution display." },
                { _id: 19, name: "TV", price: 12999, image: "/media/tv.png", category: "Electronics", description: "Smart TV with streaming capabilities." },
                { _id: 20, name: "Appliances", price: 49999, image: "/media/applinces.webp", category: "Home", description: "Home appliances for modern living." },
                { _id: 21, name: "Furniture", price: 40999, image: "/media/furniture.jpeg", category: "Home", description: "Modern furniture for your home." },
                { _id: 22, name: "Cricket Kit", price: 17999, image: "/media/kit.png", category: "Sports", description: "Complete cricket kit for players." },
                { _id: 23, name: "Bluetooth Headphone", price: 699, image: "/media/bluetoothheadphone.png", category: "Electronics", description: "Wireless headphones with noise cancellation." },
                { _id: 24, name: "Speaker", price: 7999, image: "/media/speaker.png", category: "Electronics", description: "High-quality speaker for immersive sound." },
                { _id: 25, name: "Cold Drinks", price: 99, image: "/media/drinks.jpg", category: "Food", description: "Refreshing cold drinks for summer." },
                { _id: 26, name: "Running Shoes", price: 999, image: "/media/shoe.webp", category: "Fashion", description: "Comfortable running shoes for athletes." },
                { _id: 27, name: "Hair Care Kit", price: 299, image: "/media/haircare.png", category: "Beauty", description: "Complete hair care kit for healthy hair." },
                { _id: 28, name: "Slipper", price: 399, image: "/media/slipper.png", category: "Fashion", description: "Comfortable slippers for home use." },
                { _id: 29, name: "Tooth Paste", price: 49, image: "/media/paste.png", category: "Health", description: "Fluoride toothpaste for dental care." },
                { _id: 30, name: "Fortune Oil", price: 399, image: "/media/oil.png", category: "Food", description: "Healthy cooking oil for daily use." },
                { _id: 31, name: "Maggie", price: 29, image: "/media/maggie.png", category: "Food", description: "Instant noodles for quick meals." },
                { _id: 32, name: "Harpic", price: 99, image: "/media/harpic.png", category: "Home", description: "Toilet cleaner for hygiene." }
            ];
            
            await db.collection('products').insertMany(products);
            console.log(`Seeded ${products.length} products.`);
        }
    } catch (err) {
        console.error('Error initializing database: ' + err.message);
    }
};

// Export the database connection
module.exports = {
    connectDB,
    getDb: () => db,
    getClient: () => client,
    ObjectId
};
