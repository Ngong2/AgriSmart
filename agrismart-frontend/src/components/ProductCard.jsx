import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ p }) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
      {/* Product Image */}
      <img
        src={p.images?.[0] || 'https://via.placeholder.com/300'}
        alt={p.title}
        className="w-full h-44 md:h-48 object-cover"
      />

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{p.title}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {p.description?.slice(0, 120)}{p.description?.length > 120 && '...'}
        </p>
        <b className="text-green-700">{p.price} KES / {p.unit}</b>

        {/* View Button */}
        <div className="mt-4">
          <Link
            to={`/product/${p._id}`}
            className="inline-block bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
