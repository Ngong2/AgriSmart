import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';

export default function OrdersPage() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const type = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchOrders();
  }, [type, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders?type=${type}&page=${page}&limit=10`);
      setOrders(res.data.orders || []);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        total: res.data.total
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const paymentColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <div className="flex flex-col space-y-1">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${paymentColors[paymentStatus]}`}>
          {paymentStatus}
        </span>
      </div>
    );
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ type, page: newPage });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-600">Manage your orders and track their status</p>
      </div>

      {/* Order Type Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSearchParams({ type: 'all' })}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                type === 'all'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setSearchParams({ type: 'buying' })}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                type === 'buying'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Purchases
            </button>
            {user?.role === 'farmer' && (
              <button
                onClick={() => setSearchParams({ type: 'selling' })}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  type === 'selling'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Sales
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              {type === 'buying' 
                ? "You haven't placed any orders yet."
                : type === 'selling'
                ? "You haven't received any orders yet."
                : "You don't have any orders yet."}
            </p>
            <div className="mt-6">
              <Link
                to="/marketplace"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order._id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()} • 
                            {type === 'buying' ? ` Seller: ${order.sellerId?.name}` : ` Buyer: ${order.buyerId?.name}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-700">{order.total} KES</p>
                          <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="mt-4">
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex-shrink-0">
                              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} × {item.price} KES
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex-shrink-0 flex items-center">
                              <span className="text-sm text-gray-500">
                                +{order.items.length - 3} more
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(order.orderStatus, order.paymentStatus)}
                        </div>
                        
                        <div className="mt-3 sm:mt-0 flex space-x-3">
                          {order.paymentStatus !== 'paid' && type === 'buying' && (
                            <Link
                              to={`/payment/${order._id}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Pay Now
                            </Link>
                          )}
                          <Link
                            to={`/orders/${order._id}`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(page * 10, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}