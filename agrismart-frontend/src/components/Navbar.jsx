// src/components/Navbar.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBars, FaTimes, FaShoppingCart, FaUser, FaSeedling, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cartItems = JSON.parse(localStorage.getItem('agri_cart') || '[]');
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Check if user is on dashboard pages
  const isOnDashboard = location.pathname === '/farmer-dashboard' || 
                       location.pathname === '/buyer-dashboard' ||
                       location.pathname === '/admin-dashboard';

  // Define navigation links - hide main nav links on dashboard pages
  const navLinks = isOnDashboard ? [] : [
    { path: '/', label: 'Home', icon: <FaSeedling className="inline mr-1" /> },
    { path: '/marketplace', label: 'Marketplace', icon: <FaShoppingCart className="inline mr-1" /> },
    { path: '/about', label: 'About', icon: null },
    { path: '/contact', label: 'Contact', icon: null },
  ];

  // Auth links - hide on dashboard pages
  const authLinks = isOnDashboard ? [] : [
    { path: '/login', label: 'Sign In', isButton: false },
    { path: '/register', label: 'Sign Up', isButton: true }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isOnDashboard ? (user?.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard') : "/"} 
            className="flex items-center space-x-2 text-green-700 hover:text-green-800"
          >
            <FaSeedling className="text-2xl" />
            <span className="text-xl font-bold">AgriSmart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActiveRoute(link.path)
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart - Only show if not on dashboard */}
                {!isOnDashboard && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-green-700 transition"
                  >
                    <FaShoppingCart className="text-xl" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-green-700 text-sm" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {/* PROFILE LINK ADDED HERE */}
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaUserCircle className="mr-2 text-green-600" />
                        My Profile
                      </Link>
                      
                      <Link
                        to={user?.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Orders
                      </Link>
                      {user?.role === 'farmer' && (
                        <Link
                          to="/create"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Add Product
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Only show login/signup if not on dashboard
              !isOnDashboard && (
                <div className="flex items-center space-x-3">
                  {authLinks.map(link => (
                    link.isButton ? (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition"
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                </div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && !isOnDashboard && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-green-700 transition"
              >
                <FaShoppingCart className="text-xl" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-green-700 hover:bg-gray-100 transition"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {/* Only show nav links if not on dashboard */}
              {!isOnDashboard && navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition ${
                    isActiveRoute(link.path)
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  {/* PROFILE LINK ADDED IN MOBILE MENU */}
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUserCircle className="mr-2 text-green-600" />
                    My Profile
                  </Link>
                  
                  <Link
                    to={user?.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}
                    className="px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {user?.role === 'farmer' && (
                    <Link
                      to="/create"
                      className="px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Add Product
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                // Only show login/signup in mobile if not on dashboard
                !isOnDashboard && (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-2 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md transition"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-2 text-base font-medium text-white bg-green-700 rounded-md hover:bg-green-800 transition text-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;