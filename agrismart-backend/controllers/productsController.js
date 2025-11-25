// controllers/productsController.js
const Product = require('../models/Product');
const { uploadBuffer } = require('../services/cloudinaryService');

const createProduct = async (req, res) => {
  try {
    const { title, description, price, quantity, unit, category, lng, lat } = req.body;
    
    // Validate required fields
    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    const product = new Product({
      sellerId: req.user._id,
      title, 
      description, 
      price: parseFloat(price), 
      quantity: quantity ? parseInt(quantity) : 0, 
      unit: unit || 'kg', 
      category,
      location: { 
        type: 'Point', 
        coordinates: [parseFloat(lng) || 36.8219, parseFloat(lat) || -1.2921]
      }
    });

    // Handle image upload to Cloudinary
    if (req.file) {
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET) {
          
          console.log('Uploading image to Cloudinary...');
          const imageUrl = await uploadBuffer(req.file.buffer);
          product.images.push(imageUrl);
          console.log('Image uploaded successfully:', imageUrl);
        } else {
          console.warn('Cloudinary credentials not found, using placeholder');
          product.images.push('https://via.placeholder.com/400x300.png?text=Product+Image');
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Fallback to placeholder on upload error
        product.images.push('https://via.placeholder.com/400x300.png?text=Upload+Failed');
      }
    } else {
      // Add default image if no image provided
      product.images.push('https://via.placeholder.com/400x300.png?text=No+Image');
    }

    await product.save();
    
    // Populate seller info
    await product.populate('sellerId', 'name email phone');
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      message: 'Server error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const listProducts = async (req, res) => {
  try {
    const { q, category, min, max, page = 1, limit = 20, myProducts } = req.query;
    const filter = {};
    
    // Filter by search query
    if (q) filter.title = { $regex: q, $options: 'i' };
    
    // Filter by category
    if (category) filter.category = category;
    
    // Filter by price range
    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = parseFloat(min);
      if (max) filter.price.$lte = parseFloat(max);
    }
    
    // Filter by seller (for farmer's own products)
    if (myProducts === 'true' && req.user) {
      filter.sellerId = req.user._id;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name email phone');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check ownership
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update basic fields
    const { title, description, price, quantity, unit, category } = req.body;
    if (title) product.title = title;
    if (description !== undefined) product.description = description;
    if (price) product.price = parseFloat(price);
    if (quantity !== undefined) product.quantity = parseInt(quantity);
    if (unit) product.unit = unit;
    if (category !== undefined) product.category = category;

    // Handle image update
    if (req.file) {
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET) {
          
          const imageUrl = await uploadBuffer(req.file.buffer);
          // Replace the first image or add new one
          if (product.images.length > 0) {
            product.images[0] = imageUrl;
          } else {
            product.images.push(imageUrl);
          }
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
      }
    }
    
    await product.save();
    
    // Populate seller info
    await product.populate('sellerId', 'name email phone');
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

const listMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('List my products error:', error);
    res.status(500).json({ message: 'Server error fetching your products' });
  }
};

module.exports = { 
  createProduct, 
  listProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct,
  listMyProducts
};