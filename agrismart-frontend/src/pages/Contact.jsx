// frontend/src/pages/Contact.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-3xl text-green-600" />,
      title: 'Our Location',
      content: 'Nairobi, Kenya',
      details: 'Upper Hill, Nairobi'
    },
    {
      icon: <FaPhone className="text-3xl text-green-600" />,
      title: 'Phone Number',
      content: '+254 700 123 456',
      details: 'Mon-Fri 8am-6pm'
    },
    {
      icon: <FaEnvelope className="text-3xl text-green-600" />,
      title: 'Email Address',
      content: 'info@agrismart.co.ke',
      details: 'support@agrismart.co.ke'
    },
    {
      icon: <FaClock className="text-3xl text-green-600" />,
      title: 'Working Hours',
      content: 'Mon - Fri: 8:00 AM - 6:00 PM',
      details: 'Sat: 9:00 AM - 2:00 PM'
    }
  ];

  const faqs = [
    {
      question: 'How do I register as a farmer?',
      answer: 'Click on "Join as Farmer" button and fill in your details. Once verified, you can start listing your products.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, bank transfers, and major credit/debit cards for secure transactions.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery times vary by location, typically 1-3 days for Nairobi and 3-5 days for other regions.'
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes, once your order is dispatched, you will receive a tracking number via SMS and email.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Get In Touch With Us
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Have questions or need support? We're here to help you grow your agricultural business.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center"
            >
              <div className="flex justify-center mb-4">
                {info.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {info.title}
              </h3>
              <p className="text-gray-700 font-medium mb-1">
                {info.content}
              </p>
              <p className="text-gray-500 text-sm">
                {info.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Send Us a Message
            </h2>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700">
                  Thank you for contacting us! We'll get back to you soon.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+254 700 000 000"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Map & Additional Info */}
          <div className="space-y-8">
            {/* Map Placeholder */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-5xl text-green-600 mx-auto mb-2" />
                  <p className="text-gray-600">Map Location</p>
                  <p className="text-sm text-gray-500">Upper Hill, Nairobi, Kenya</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Follow Us
              </h3>
              <p className="text-gray-600 mb-6">
                Stay connected with us on social media for updates and news
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition duration-300"
                >
                  <FaFacebook className="text-xl" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition duration-300"
                >
                  <FaTwitter className="text-xl" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition duration-300"
                >
                  <FaInstagram className="text-xl" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-600 hover:text-white transition duration-300"
                >
                  <FaLinkedin className="text-xl" />
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-green-50 p-8 rounded-lg border border-green-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Business Hours
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="font-medium text-gray-800">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Saturday</span>
                  <span className="font-medium text-gray-800">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Sunday</span>
                  <span className="font-medium text-gray-800">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;