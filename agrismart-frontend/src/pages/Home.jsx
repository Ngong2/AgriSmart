// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaSeedling, FaShoppingCart, FaUsers, FaTruck, FaShieldAlt, FaLeaf } from 'react-icons/fa';
import farmerImage from '../assets/Smiling Farmer.png';

const Home = () => {
  const features = [
    {
      icon: <FaSeedling className="text-4xl text-green-600" />,
      title: 'Fresh Produce',
      description: 'Get access to fresh, high-quality farm produce directly from local farmers.'
    },
    {
      icon: <FaShoppingCart className="text-4xl text-green-600" />,
      title: 'Easy Marketplace',
      description: 'Simple and intuitive platform for buying and selling agricultural products.'
    },
    {
      icon: <FaTruck className="text-4xl text-green-600" />,
      title: 'Fast Delivery',
      description: 'Efficient delivery system to get your products to you quickly and safely.'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-600" />,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with M-Pesa integration.'
    },
    {
      icon: <FaUsers className="text-4xl text-green-600" />,
      title: 'Community Driven',
      description: 'Building a sustainable agricultural ecosystem through collaboration.'
    },
    {
      icon: <FaLeaf className="text-4xl text-green-600" />,
      title: 'Sustainable Farming',
      description: 'Promoting environmentally friendly and sustainable farming practices.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Happy Farmers' },
    { number: '2,000+', label: 'Products Listed' },
    { number: '10,000+', label: 'Orders Completed' },
    { number: '98%', label: 'Customer Satisfaction' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Connecting Farmers & Buyers in{' '}
                <span className="text-yellow-300">Kenya</span>
              </h1>
              <p className="text-xl mb-8 text-green-100">
                AgriSmart empowers sustainable agriculture by creating a seamless marketplace 
                for farmers to sell their produce and buyers to discover fresh, high-quality products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/marketplace"
                  className="bg-yellow-400 text-green-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition duration-300 text-center"
                >
                  Shop Now
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-green-800 transition duration-300 text-center"
                >
                  Join as Farmer
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <img
                src={farmerImage} // Fixed: removed quotes to use the imported variable
                alt="Smiling Farmer"
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-700 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Why Choose AgriSmart?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing agriculture in Kenya by connecting farmers directly with buyers, 
              eliminating middlemen, and ensuring fair prices for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Join the AgriSmart Community?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Whether you're a farmer looking to reach more customers or a buyer searching for 
            fresh produce, AgriSmart is your platform to grow, connect, and thrive.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register?role=farmer"
              className="bg-yellow-400 text-green-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition duration-300"
            >
              Start Selling
            </Link>
            <Link
              to="/register?role=buyer"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-green-800 transition duration-300"
            >
              Start Buying
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from farmers and buyers who are already benefiting from AgriSmart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'John Kamau',
                role: 'Farmer',
                content: 'AgriSmart has transformed my farming business. I can now reach customers directly and get fair prices for my produce.',
                location: 'Nakuru'
              },
              {
                name: 'Sarah Mwende',
                role: 'Buyer',
                content: 'The quality of produce I get through AgriSmart is amazing. Fresh, affordable, and delivered right to my doorstep.',
                location: 'Nairobi'
              },
              {
                name: 'David Ochieng',
                role: 'Farmer',
                content: 'The platform is easy to use and the payment system is very reliable. My income has increased significantly.',
                location: 'Kisumu'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-700 font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;