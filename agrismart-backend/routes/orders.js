const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createOrder, 
  getOrder, 
  getUserOrders, 
  updateOrderStatus, 
  initiatePayment, 
  mpesaCallback,
  checkPaymentStatus
} = require('../controllers/ordersController');

router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrder);
router.put('/:id/status', auth, updateOrderStatus);

// Payment routes
router.post('/payments/mpesa/initiate', auth, initiatePayment);
router.get('/:orderId/payment-status', auth, checkPaymentStatus);

// M-Pesa callback (no auth required - called by Safaricom)
router.post('/payments/mpesa/callback', mpesaCallback);

module.exports = router;