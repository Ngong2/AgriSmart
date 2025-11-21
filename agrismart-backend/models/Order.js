// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    title: String,
    image: String
  }],
  total: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'accepted', 'shipped', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  mpesaTransaction: {
    checkoutId: String,
    merchantRequestId: String,
    transactionId: String,
    receiptNumber: String,
    amount: Number,
    phone: String,
    timestamp: Date,
    rawResponse: Object
  },
  paymentAttempts: [{
    checkoutId: String,
    timestamp: { type: Date, default: Date.now },
    amount: Number,
    phone: String,
    status: String
  }]
}, { 
  timestamps: true 
});

// Index for better query performance
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });
orderSchema.index({ 'mpesaTransaction.checkoutId': 1 });

module.exports = mongoose.model('Order', orderSchema);