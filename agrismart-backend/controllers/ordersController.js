const Order = require('../models/Order');
const Product = require('../models/Product');
const { 
  initiateMpesaPayment, 
  handleMpesaCallback,
  initiateMockPayment 
} = require('../services/mpesaService');

const createOrder = async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'No items' });

  try {
    const lines = [];
    let total = 0;
    let sellerId = null;

    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) return res.status(400).json({ message: `Product ${it.productId} not found` });
      if (product.quantity < it.quantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for ${product.title}. Available: ${product.quantity}` 
        });
      }
      if (!sellerId) sellerId = product.sellerId;
      const price = product.price;
      const qty = Number(it.quantity);
      lines.push({ 
        productId: product._id, 
        quantity: qty, 
        price,
        title: product.title,
        image: product.images?.[0] 
      });
      total += price * qty;
      
      // Update product quantity
      product.quantity -= qty;
      await product.save();
    }

    const order = new Order({ 
      buyerId: req.user._id, 
      sellerId, 
      items: lines, 
      total,
      orderStatus: 'pending'
    });
    await order.save();

    // Populate order details for response
    await order.populate('buyerId sellerId', 'name email phone');
    
    res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId')
      .populate('buyerId sellerId', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check if user is authorized to view this order
    if (order.buyerId._id.toString() !== req.user._id.toString() && 
        order.sellerId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 10 } = req.query;
    let query = {};

    if (type === 'buying') {
      query.buyerId = req.user._id;
    } else if (type === 'selling') {
      query.sellerId = req.user._id;
    } else {
      query.$or = [{ buyerId: req.user._id }, { sellerId: req.user._id }];
    }

    const orders = await Order.find(query)
      .populate('buyerId sellerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['pending', 'accepted', 'shipped', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Authorization check
    if (req.user.role !== 'admin' && order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

const initiatePayment = async (req, res) => {
  try {
    const { orderId, phone } = req.body;
    
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if user owns this order
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Check if already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    let paymentResult;
    
    // Use mock payment in development, real M-Pesa in production
    if (process.env.NODE_ENV === 'production' && process.env.MPESA_CONSUMER_KEY) {
      paymentResult = await initiateMpesaPayment({
        orderId: order._id,
        amount: order.total,
        phone: phone.trim()
      });
    } else {
      paymentResult = await initiateMockPayment({
        orderId: order._id,
        amount: order.total,
        phone: phone.trim()
      });
    }

    // Store checkout ID in order
    order.mpesaTransaction = { checkoutId: paymentResult.checkoutId };
    await order.save();

    res.json(paymentResult);
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ 
      message: error.message || 'Payment initiation failed' 
    });
  }
};

// M-Pesa callback webhook
const mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback Received:', JSON.stringify(req.body, null, 2));
    
    const result = await handleMpesaCallback(req.body);
    
    if (result.success) {
      res.json({ 
        ResultCode: 0, 
        ResultDesc: 'Success' 
      });
    } else {
      res.json({ 
        ResultCode: 1, 
        ResultDesc: result.message || 'Failed' 
      });
    }
  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    res.json({ 
      ResultCode: 1, 
      ResultDesc: 'Callback processing failed' 
    });
  }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      mpesaTransaction: order.mpesaTransaction
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ message: 'Server error checking payment status' });
  }
};

module.exports = { 
  createOrder, 
  getOrder, 
  getUserOrders, 
  updateOrderStatus, 
  initiatePayment, 
  mpesaCallback,
  checkPaymentStatus
};