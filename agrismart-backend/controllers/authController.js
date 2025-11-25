const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Constants
const TOKEN_EXPIRY = '7d';
const RESET_TOKEN_EXPIRY = 3600000; // 1 hour
const SALT_ROUNDS = 10;

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
    }
  });
};

// Utility functions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret', { 
    expiresIn: TOKEN_EXPIRY 
  });
};

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  bio: user.bio,
  farmName: user.farmName,
  farmLocation: user.farmLocation,
  farmSize: user.farmSize,
  farmingType: user.farmingType,
  language: user.language
});

const validateRequiredFields = (fields, required) => {
  const missing = required.filter(field => !fields[field]);
  return missing.length > 0 ? `${missing.join(', ')} are required` : null;
};

const PROFILE_FIELDS = [
  'name',
  'email',
  'phone',
  'address',
  'bio',
  'farmName',
  'farmLocation',
  'farmSize',
  'farmingType',
  'language'
];

// Register Controller
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    console.log('Registration attempt:', { name, email, phone, role });

    // Validate required fields
    const validationError = validateRequiredFields(req.body, ['name', 'email', 'password']);
    if (validationError) {
      return res.status(400).json({ 
        success: false,
        message: validationError 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const user = new User({ 
      name, 
      email, 
      phone: phone || '', 
      password: hashedPassword,
      role: role || 'buyer'
    });
    
    await user.save();

    // Generate token and respond
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: formatUserResponse(user),
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during registration' 
    });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Validate required fields
    const validationError = validateRequiredFields(req.body, ['email', 'password']);
    if (validationError) {
      return res.status(400).json({ 
        success: false,
        message: validationError 
      });
    }

    // Find user and validate
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate token and respond
    const token = generateToken(user._id);

    console.log('Login successful for user:', user.email, 'Role:', user.role);

    res.json({
      success: true,
      token,
      user: formatUserResponse(user),
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during login' 
    });
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return generic message for security
      return res.json({
        success: true,
        message: 'If the email exists, password reset instructions have been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + RESET_TOKEN_EXPIRY;

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Use deployed frontend URL
    const resetUrl = `${process.env.FRONTEND_URL || 'https://agri-smart-five.vercel.app'}/reset-password/${resetToken}`;
    
    // Send email
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: `AgriConnect <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request - AgriConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2d7738; margin: 0;">AgriConnect</h2>
            </div>
            <h3 style="color: #333;">Password Reset Request</h3>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2d7738; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;
                        font-size: 16px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br><strong>AgriConnect Team</strong></p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to: ${user.email}`);
      
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue anyway for security
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Reset URL (development):', resetUrl);
    }

    res.json({
      success: true,
      message: 'If the email exists, password reset instructions have been sent.',
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error. Please try again later.' 
    });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Reset token and new password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = Date.now();
    
    await user.save();

    res.json({ 
      success: true,
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during password reset' 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const updates = {};

    PROFILE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(updatedUser),
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.lastPasswordChange = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error updating password'
    });
  }
};

// Logout Controller
const logout = async (req, res) => {
  try {
    if (req.user) {
      req.user.lastLogoutAt = Date.now();
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getProfile,
  updateProfile,
  changePassword
};