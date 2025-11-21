import React, { useState, useContext, useEffect } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCreate() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    quantity: '', 
    unit: 'kg', 
    category: '' 
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert('Please login first to create a product');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size should be less than 5MB' });
        return;
      }

      setImage(file);
      setErrors({ ...errors, image: '' });

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (form.quantity && parseFloat(form.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key]) {
        formData.append(key, form[key]);
      }
    });
    
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await api.post('/products', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      alert('Product Created Successfully!');
      navigate('/product/' + res.data._id);
    } catch (err) {
      console.error('Create product error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create product';
      alert(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center mt-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please login to create a product
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-8 mb-12 px-4">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Create Product</h2>

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            placeholder="Product Title"
            value={form.title}
            onChange={handleChange}
            required
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            placeholder="Product Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                required
                className={`w-full border rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              min="0"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Unit</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lb">lb</option>
            <option value="piece">piece</option>
            <option value="bunch">bunch</option>
            <option value="bag">bag</option>
            <option value="box">box</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Category</label>
          <input
            type="text"
            name="category"
            placeholder="e.g., Vegetables, Fruits, Grains, Dairy"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-700"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          
          {imagePreview && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Product'
          )}
        </button>
      </form>
    </div>
  );
}