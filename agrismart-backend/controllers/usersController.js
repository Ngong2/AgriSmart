const User = require('../models/User');

const getMe = async (req, res) => {
  const user = req.user;
  res.json(user);
};

const updateMe = async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
  res.json(user);
};

module.exports = { getMe, updateMe };
