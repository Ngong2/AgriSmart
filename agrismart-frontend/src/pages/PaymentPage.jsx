// src/pages/PaymentPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function PaymentPage() {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    let pollInterval;
    
    if (order && order.paymentStatus === 'pending' && countdown > 0) {
      pollInterval = setInterval(fetchPaymentStatus, 5000);
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [order, countdown]);

  useEffect(() => {
    let countdownTimer;
    
    if (countdown > 0) {
      countdownTimer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && loading) {
      setLoading(false);
    }
    
    return () => {
      if (countdownTimer) clearTimeout(countdownTimer);
    };
  }, [countdown, loading]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
      setPaymentStatus(res.data.paymentStatus);
      
      if (res.data.paymentStatus === 'paid') {
        navigate('/orders', { 
          state: { message: 'Payment successful! Your order is being processed.' } 
        });
      }
    } catch (err) {
      setError('Failed to load order details');
      console.error('Order fetch error:', err);
    }
  };

  const fetchPaymentStatus = async () => {
    if (!order || order.paymentStatus !== 'pending') return;
    
    try {
      const res = await api.get(`/orders/${orderId}/payment-status`);
      const newStatus = res.data.paymentStatus;
      setPaymentStatus(newStatus);
      
      if (newStatus === 'paid') {
        setCountdown(0);
        setLoading(false);
        navigate('/orders', { 
          state: { message: 'Payment successful! Your order is being processed.' } 
        });
      } else if (newStatus === 'failed') {
        setCountdown(0);
        setLoading(false);
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment status fetch error:', err);
    }
  };

  const validatePhone = (phoneNumber) => {
    const cleanedPhone = phoneNumber.trim().replace(/[-\s]/g, '');
    const phoneRegex = /^(07\d{8}|2547\d{8}|011\d{7,8})$/;
    return phoneRegex.test(cleanedPhone);
  };

  const formatPhone = (phoneNumber) => {
    let cleanedPhone = phoneNumber.trim().replace(/[-\s]/g, '');
    
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '254' + cleanedPhone.substring(1);
    }
    if (cleanedPhone.startsWith('+')) {
      cleanedPhone = cleanedPhone.substring(1);
    }
    
    return cleanedPhone;
  };

  const initiatePayment = async () => {
    setError('');
    
    if (!validatePhone(phone)) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    const formattedPhone = formatPhone(phone);
    setLoading(true);
    setCountdown(120); // 2-minute countdown for payment completion

    try {
      const res = await api.post('/orders/payments/mpesa/initiate', { 
        orderId, 
        phone: formattedPhone 
      });
      
      if (res.data.success) {
        // Success - STK Push sent
        console.log('Payment initiated:', res.data);
      } else {
        setError(res.data.message || 'Payment initiation failed');
        setCountdown(0);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Payment initiation failed';
      setError(errorMessage);
      setCountdown(0);
      console.error('Payment initiation error:', err);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cancelPayment = () => {
    setCountdown(0);
    setLoading(false);
    setError('');
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
            <p className="text-green-100 mt-1">Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} KES
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-700">
                  {order.total.toLocaleString()} KES
                </span>
              </div>
            </div>

            {/* Payment Status */}
            <div className={`p-4 rounded-lg ${
              paymentStatus === 'paid' ? 'bg-green-50 border border-green-200' :
              paymentStatus === 'failed' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Payment Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {paymentStatus.toUpperCase()}
                </span>
              </div>
              {countdown > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time remaining:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {formatCountdown(countdown)}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {paymentStatus === 'pending' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., 0712345678 or 254712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter your M-Pesa registered phone number. You will receive a payment prompt.
                  </p>
                </div>

                <div className="flex space-x-4">
                  {!loading ? (
                    <>
                      <button
                        onClick={initiatePayment}
                        className="flex-1 bg-green-700 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-800 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Pay {order.total.toLocaleString()} KES via M-Pesa
                      </button>
                      <button
                        onClick={() => navigate('/orders')}
                        className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        disabled
                        className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold opacity-50 cursor-not-allowed"
                      >
                        Processing... {formatCountdown(countdown)}
                      </button>
                      <button
                        onClick={cancelPayment}
                        className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                      >
                        Cancel Payment
                      </button>
                    </>
                  )}
                </div>

                {/* Payment Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Payment Instructions
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
                    <li>Ensure your phone is nearby and has network connection</li>
                    <li>Enter your M-Pesa registered phone number</li>
                    <li>Click "Pay via M-Pesa" button</li>
                    <li>Check your phone for STK Push prompt immediately</li>
                    <li>Enter your M-Pesa PIN when prompted</li>
                    <li>Wait for automatic confirmation (up to 2 minutes)</li>
                    <li>Do not close this page until payment is confirmed</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Success State */}
            {paymentStatus === 'paid' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">
                  Your payment has been processed successfully. Your order is now being prepared.
                </p>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => navigate('/orders')}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
                  >
                    View My Orders
                  </button>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}