// frontend/src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold">AgriSmart</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Connecting farmers and buyers across Kenya. Empowering sustainable agriculture 
              through innovative technology and creating a seamless marketplace for fresh produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-green-500 transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-300 hover:text-green-500 transition text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-green-500 transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-green-500 transition text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">For Farmers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?role=farmer" className="text-gray-300 hover:text-green-500 transition text-sm">
                  Sell on AgriSmart
                </Link>
              </li>
              <li>
                <Link to="/farmer-dashboard" className="text-gray-300 hover:text-green-500 transition text-sm">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition text-sm">
                  Farming Resources
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-500 transition text-sm">
                  Pricing Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-green-500" />
                <span className="text-gray-300 text-sm">Kakuma, Kenya</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-green-500" />
                <span className="text-gray-300 text-sm">+254 700 000 000</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-green-500" />
                <a href="mailto:support@agrismart.com" className="text-gray-300 hover:text-green-500 transition text-sm">
                  support@agrismart.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} AgriSmart. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                Cookie Policy
              </a>
            </div>
          </div>
          <div className="text-center mt-4">
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;