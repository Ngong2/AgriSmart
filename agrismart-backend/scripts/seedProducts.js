const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const sampleProducts = [
  {
    title: "Fresh Organic Tomatoes",
    description: "Freshly harvested organic tomatoes from our farm. Perfect for cooking and salads.",
    price: 150,
    quantity: 100,
    unit: "kg",
    category: "vegetables",
    images: ["https://images.unsplash.com/photo-1546470427-e212b7d31055?w=400"],
  },
  {
    title: "Sweet Pineapples",
    description: "Sweet and juicy pineapples, perfect for fresh juice or eating as is.",
    price: 80,
    quantity: 50,
    unit: "piece",
    category: "fruits",
    images: ["https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400"],
  },
  {
    title: "Organic Carrots",
    description: "Fresh organic carrots, rich in vitamins and perfect for healthy meals.",
    price: 120,
    quantity: 75,
    unit: "kg",
    category: "vegetables",
    images: ["https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400"],
  },
  {
    title: "Avocados",
    description: "Creamy and delicious avocados, perfect for guacamole or toast.",
    price: 50,
    quantity: 60,
    unit: "piece",
    category: "fruits",
    images: ["https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400"],
  },
  {
    title: "Fresh Kale",
    description: "Nutrient-rich kale leaves, perfect for salads and smoothies.",
    price: 200,
    quantity: 30,
    unit: "bunch",
    category: "vegetables",
    images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400"],
  },
  {
    title: "Bananas",
    description: "Sweet and ripe bananas, great for snacks or baking.",
    price: 100,
    quantity: 120,
    unit: "bunch",
    category: "fruits",
    images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400"],
  },
  {
    title: "Bell Peppers",
    description: "Colorful bell peppers in red, yellow, and green varieties.",
    price: 180,
    quantity: 40,
    unit: "kg",
    category: "vegetables",
    images: ["https://images.unsplash.com/photo-1525607551107-68e20c75b1a9?w=400"],
  },
  {
    title: "Mangoes",
    description: "Sweet and juicy mangoes, perfect for desserts and smoothies.",
    price: 90,
    quantity: 80,
    unit: "piece",
    category: "fruits",
    images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"],
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrismart');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Find a farmer user to assign as seller
    const farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      console.log('No farmer user found. Please create a farmer account first.');
      return;
    }

    // Add sample products
    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      sellerId: farmer._id,
      location: {
        type: 'Point',
        coordinates: [36.8219, -1.2921] // Nairobi coordinates
      }
    }));

    await Product.insertMany(productsWithSeller);
    console.log(`Added ${sampleProducts.length} sample products`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;