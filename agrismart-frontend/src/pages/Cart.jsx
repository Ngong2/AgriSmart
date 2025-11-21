import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('agri_cart') || '[]'));
  const nav = useNavigate();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const checkout = () => {
    localStorage.setItem('agri_checkout', JSON.stringify(cart));
    nav('/checkout');
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-center">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cart.map((c, idx) => (
              <li
                key={idx}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 pb-4"
              >
                <div className="text-gray-700 font-medium">{c.title}</div>
                <div className="text-gray-600 mt-2 sm:mt-0">
                  {c.quantity} × {c.price} KES ={' '}
                  <span className="font-semibold text-green-700">{c.quantity * c.price} KES</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-bold text-green-700">{total} KES</span>
          </div>

          <button
            onClick={checkout}
            className="w-full sm:w-auto bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 transition"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
