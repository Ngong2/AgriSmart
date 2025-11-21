const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  category: { type: String },
  images: [{ type: String }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0,0] }
  }
}, { timestamps: true });

productSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Product', productSchema);
