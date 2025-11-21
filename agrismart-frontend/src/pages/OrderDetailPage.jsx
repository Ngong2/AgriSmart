import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      alert('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { orderStatus: newStatus });
      fetchOrder(); // Refresh order data
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <Link to="/orders" className="text-green-600 hover:text-green-700">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isSeller = user?.role === 'farmer' && order.sellerId?._id === user?._id;
  const isBuyer = order.buyerId?._id === user?._id;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/orders" className="text-green-600 hover:text-green-700 mb-4 inline-block">
          &larr; Back to Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
        <p className="text-gray-600">Order #{order._id.slice(-8).toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 border-b pb-4 last:border-b-0">
                  <img
                    src={item.image || item.productId?.images?.[0] || 'https://via.placeholder.com/80'}
                    alt={item.title || item.productId?.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {item.title || item.productId?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} {item.productId?.unit || 'unit'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: {item.price} KES per {item.productId?.unit || 'unit'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">
                      {item.quantity * item.price} KES
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                <span className="text-xl font-bold text-green-700">{order.total} KES</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-800">Order Placed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {order.paymentStatus === 'paid' && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">Payment Completed</p>
                    <p className="text-sm text-gray-600">
                      {order.mpesaTransaction?.timestamp 
                        ? new Date(order.mpesaTransaction.timestamp).toLocaleString()
                        : 'Payment completed'
                      }
                    </p>
                    {order.mpesaTransaction?.id && (
                      <p className="text-sm text-gray-500">
                        Transaction ID: {order.mpesaTransaction.id}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  ['accepted', 'shipped', 'completed'].includes(order.orderStatus) 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-800">Order {order.orderStatus}</p>
                  <p className="text-sm text-gray-600">Current status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium">{order._id.slice(-8).toUpperCase()}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.orderStatus === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : order.orderStatus === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isBuyer ? 'Seller Information' : 'Buyer Information'}
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {isBuyer ? order.sellerId?.name : order.buyerId?.name}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">
                  {isBuyer ? order.sellerId?.email : order.buyerId?.email}
                </p>
              </div>
              
              {order.sellerId?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{order.sellerId.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isSeller && order.paymentStatus === 'paid' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Order</h2>
              
              <div className="space-y-2">
                {order.orderStatus === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus('accepted')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Accept Order
                  </button>
                )}
                
                {order.orderStatus === 'accepted' && (
                  <button
                    onClick={() => updateOrderStatus('shipped')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {order.orderStatus === 'shipped' && (
                  <button
                    onClick={() => updateOrderStatus('completed')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                  >
                    Mark as Completed
                  </button>
                )}
                
                {['pending', 'accepted'].includes(order.orderStatus) && (
                  <button
                    onClick={() => updateOrderStatus('cancelled')}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          )}

          {isBuyer && order.paymentStatus !== 'paid' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Payment</h2>
              <Link
                to={`/payment/${order._id}`}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition text-center block"
              >
                Pay with M-Pesa
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}