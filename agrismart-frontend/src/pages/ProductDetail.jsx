import React, { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/products/' + id)
      .then(res => setProduct(res.data))
      .catch(console.error);
  }, [id]);

  const addToCart = () => {
    if (!user) return alert('Please login first');
    const raw = localStorage.getItem('agri_cart') || '[]';
    const cart = JSON.parse(raw);
    cart.push({ productId: product._id, title: product.title, price: product.price, quantity: qty });
    localStorage.setItem('agri_cart', JSON.stringify(cart));
    alert('Added to cart');
    nav('/cart');
  };

  if (!product) return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/600x300'}
            alt={product.title}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <p className="text-gray-700">{product.description}</p>
          <div className="text-xl font-semibold text-green-700">{product.price} KES</div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <button
              onClick={addToCart}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
