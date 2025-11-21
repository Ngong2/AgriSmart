import React, { useEffect, useState } from 'react';
import api from '../api/api';
import ProductCard from '../components/ProductCard';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching products from API...');
      
      const response = await api.get('/products');
      console.log('Products API response:', response);
      
      // Handle different response formats
      let productsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Case 1: Direct array
        productsData = response.data;
      } else if (response.data && Array.isArray(response.data.products)) {
        // Case 2: { products: [] }
        productsData = response.data.products;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Case 3: { data: [] }
        productsData = response.data.data;
      } else {
        setError('Invalid response format from server');
        console.error('Invalid response format:', response.data);
        return;
      }
      
      setProducts(productsData);
      console.log(`Loaded ${productsData.length} products`);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Marketplace</h2>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p className="text-gray-500 mt-2">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Marketplace</h2>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Marketplace</h2>
        <button
          onClick={fetchProducts}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition text-sm"
        >
          Refresh
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0h-4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products available</h3>
          <p className="mt-2 text-gray-500">Be the first to add a product to the marketplace!</p>
          <div className="mt-6">
            <a
              href="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your Product
            </a>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">Found {products.length} products</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p._id || p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}