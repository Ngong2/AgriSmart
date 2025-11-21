// services/mpesaService.js
const axios = require('axios');
const Order = require('../models/Order');

// Get M-Pesa access token
async function getMpesaAccessToken() {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    // Use production URL for live payments
    const url = process.env.NODE_ENV === 'production' 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa token error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

// Initiate STK Push for real payments
async function initiateMpesaPayment({ orderId, amount, phone }) {
  try {
    const accessToken = await getMpesaAccessToken();
    
    // Format phone number for production
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, '')
      .slice(0, -4);
    
    const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    
    const password = Buffer.from(
      businessShortCode + passkey + timestamp
    ).toString('base64');

    // Use production URL for live payments
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const requestData = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.API_URL}/api/orders/payments/mpesa/callback`,
      AccountReference: `AGRI${orderId}`,
      TransactionDesc: 'AgriSmart Product Purchase',
    };

    console.log('M-Pesa Request Data:', requestData);

    const response = await axios.post(
      apiUrl,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log('M-Pesa Response:', response.data);

    if (response.data.ResponseCode === '0') {
      return {
        success: true,
        checkoutId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        customerMessage: response.data.CustomerMessage,
        orderId,
        amount,
      };
    } else {
      throw new Error(response.data.ResponseDescription || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('M-Pesa payment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errorMessage || 'Payment initiation failed');
  }
}

// Enhanced callback handler
async function handleMpesaCallback(payload) {
  try {
    console.log('M-Pesa Callback Received:', JSON.stringify(payload, null, 2));
    
    const stkCallback = payload.Body.stkCallback;
    
    if (!stkCallback) {
      console.error('Invalid callback structure');
      return { success: false, message: 'Invalid callback structure' };
    }

    const checkoutId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const callbackMetadata = stkCallback.CallbackMetadata;

    console.log(`Processing callback for checkout: ${checkoutId}, result: ${resultCode}`);

    if (resultCode === 0 && callbackMetadata) {
      // Successful payment
      const metadataItems = callbackMetadata.Item;
      let amount, mpesaReceiptNumber, phoneNumber, transactionDate;

      for (const item of metadataItems) {
        switch (item.Name) {
          case 'Amount':
            amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'PhoneNumber':
            phoneNumber = item.Value;
            break;
          case 'TransactionDate':
            transactionDate = item.Value;
            break;
        }
      }

      // Find order by checkout ID
      const order = await Order.findOne({ 
        'mpesaTransaction.checkoutId': checkoutId 
      });

      if (order) {
        if (order.paymentStatus === 'paid') {
          console.log(`Order ${order._id} is already paid`);
          return { success: true, order, message: 'Order already paid' };
        }

        order.paymentStatus = 'paid';
        order.orderStatus = 'accepted'; // Auto-accept order when paid
        order.mpesaTransaction = {
          id: mpesaReceiptNumber,
          checkoutId: checkoutId,
          amount: amount,
          phone: phoneNumber,
          timestamp: new Date(transactionDate),
        };
        
        await order.save();
        console.log(`Order ${order._id} payment confirmed`);
        
        return { success: true, order };
      } else {
        console.error(`Order not found for checkout ID: ${checkoutId}`);
        return { success: false, message: 'Order not found' };
      }
    } else {
      // Payment failed
      const order = await Order.findOne({ 
        'mpesaTransaction.checkoutId': checkoutId 
      });
      
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        await order.save();
        console.log(`Order ${order._id} payment failed: ${stkCallback.ResultDesc}`);
      }
      
      return { 
        success: false, 
        resultCode, 
        message: stkCallback.ResultDesc 
      };
    }
  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    throw new Error('Failed to process M-Pesa callback');
  }
}

// Mock payment for development (optional)
async function initiateMockPayment({ orderId, amount, phone }) {
  // Only use mock in development if explicitly enabled
  if (process.env.USE_REAL_MPESA === 'true') {
    throw new Error('Real M-Pesa is enabled. Use real payment flow.');
  }
  
  return {
    success: true,
    checkoutId: `mock-${Date.now()}`,
    customerMessage: 'Mock payment initiated successfully. Confirm payment to complete.',
    orderId,
    amount,
  };
}

module.exports = { 
  initiateMpesaPayment, 
  handleMpesaCallback,
  initiateMockPayment 
};