// src/pages/Checkout.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [checkoutCart, setCheckoutCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('agri_checkout') || '[]');
    setCheckoutCart(cart);
    
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [navigate]);

  const total = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const createOrder = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = checkoutCart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const res = await api.post('/orders', { items });
      setOrder(res.data);
      
      // Clear checkout cart after successful order creation
      localStorage.removeItem('agri_checkout');
      localStorage.removeItem('agri_cart');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = () => {
    if (order) {
      navigate(`/payment/${order._id}`);
    }
  };

  if (checkoutCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Items to Checkout</h2>
          <p className="text-gray-600 mb-6">Your checkout cart is empty.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              {checkoutCart.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center space-x-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-700">
                    {(item.price * item.quantity).toLocaleString()} KES
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-700">{total.toLocaleString()} KES</span>
              </div>
            </div>
          </div>

          {/* Checkout Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Complete Your Order</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!order ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Method</h4>
                  <p className="text-blue-700 text-sm">
                    We currently support M-Pesa mobile payments. After creating your order, 
                    you'll be redirected to complete the payment securely.
                  </p>
                </div>

                <button
                  onClick={createOrder}
                  disabled={loading}
                  className="w-full bg-green-700 text-white py-4 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Order...' : `Create Order - ${total.toLocaleString()} KES`}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Order Created Successfully!</h4>
                  <p className="text-green-700 text-sm">
                    Your order has been created. Proceed to complete your payment via M-Pesa.
                  </p>
                </div>

                <button
                  onClick={proceedToPayment}
                  className="w-full bg-green-700 text-white py-4 rounded-lg font-semibold hover:bg-green-800 transition"
                >
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}