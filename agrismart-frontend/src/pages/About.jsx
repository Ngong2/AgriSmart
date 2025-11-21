import React from 'react';

export default function About() {
  return (
    <div className="bg-[#FDE68A] min-h-screen">
      <div className="container mx-auto py-12 px-6 md:px-12">
        {/* Page Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-6 text-center">
          About AgriSmart
        </h1>

        {/* Introduction */}
        <p className="text-gray-800 text-base md:text-lg mb-8 text-center md:text-left max-w-3xl mx-auto">
          AgriSmart connects farmers and buyers across Kakuma and beyond, empowering sustainable agriculture through innovative technology. Our platform provides an easy way for farmers to sell their products and for buyers to discover fresh, high-quality produce directly.
        </p>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Mission */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To empower small-scale farmers with technology, streamline agricultural marketplaces, and promote sustainable farming practices in the region.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Our Vision</h2>
            <p className="text-gray-700">
              To create a thriving agricultural ecosystem in East Africa where farmers and buyers connect seamlessly, and technology drives growth, sustainability, and innovation.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-green-700 mb-4 text-center">Our Core Values</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Integrity in all transactions and interactions</li>
            <li>Empowering farmers through technology</li>
            <li>Sustainability and environmental responsibility</li>
            <li>Innovation to solve real-world agricultural challenges</li>
            <li>Community-driven growth and collaboration</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-green-700 mb-4">Join Us Today!</h3>
          <p className="text-gray-800 mb-6">Whether you are a farmer or a buyer, AgriSmart is your platform to grow, connect, and thrive.</p>
          <a 
            href="/register" 
            className="bg-green-700 text-white px-6 py-3 rounded  hover:bg-yellow-800 transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
