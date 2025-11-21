const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMe, updateMe } = require('../controllers/usersController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

module.exports = router;
