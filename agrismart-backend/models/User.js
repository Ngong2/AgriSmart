const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    validate: {
      validator: function(email) {
        return /\S+@\S+\.\S+/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  phone: { 
    type: String,
    trim: true
  },
  password: {
    type: String, 
    required: [true, 'Password is required'] 
  },
  role: { 
    type: String, 
    enum: ['buyer', 'farmer', 'admin'], 
    default: 'buyer' 
  },
  language: { 
    type: String, 
    default: 'en' 
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastPasswordChange: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ resetPasswordExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', userSchema);