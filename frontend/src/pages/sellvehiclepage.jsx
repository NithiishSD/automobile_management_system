import React, { useState } from 'react';
import { useAuth } from '../context/Authcontext';
import { apiRequest } from '../services/api';

const SellVehiclePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'good',
    mileage: '', // This should be FUEL EFFICIENCY in km/l
    expected_price: '',
    transmission: 'Manual',
    fuel_type: 'Petrol',
    accident_history: 'None reported',
    description: '',
    seller_name: user?.username || '', // Pre-fill with user info if logged in
    seller_email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.brand || !formData.model || !formData.mileage || !formData.expected_price) {
    setMessage('Please fill in all required fields');
    return;
  }

  if (formData.mileage < 0) {
    setMessage('Mileage cannot be negative');
    return;
  }

  if (formData.expected_price <= 0) {
    setMessage('Please enter a valid expected price');
    return;
  }

  if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
    setMessage('Please enter a valid year');
    return;
  }

  setLoading(true);
  setMessage('');

  try {
    console.log('Submitting form data:', formData);
    
    // REPLACE THE APIREQUEST CALL WITH THIS DIRECT FETCH:
    const response = await fetch('http://localhost:5000/api/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header - this bypasses JWT
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    console.log('API response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    setMessage(data.message || 'Your vehicle has been submitted for review! We will contact you soon.');
    
    // Reset form on success
    setFormData({
      type: 'car',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      condition: 'used',
      mileage: '',
      expected_price: '',
      transmission: 'Manual',
      fuel_type: 'Petrol',
      accident_history: 'None reported',
      description: '',
      seller_name: '',
      seller_email: '',
    });
  } catch (error) {
    console.error('Submission error:', error);
    setMessage('Failed to submit: ' + (error.message || 'Unknown error. Please check your connection.'));
  }
  
  setLoading(false);
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Sell Your Vehicle</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* User Status */}
        {user ? (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-green-700">
              ✅ Logged in as: <strong>{user.username}</strong>
            </p>
            <p className="text-sm text-green-600">
              Your vehicle will be linked to your account
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-700">
              ℹ️ You are not logged in. Your submission will be as a guest.
            </p>
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
              <input
                type="text"
                name="brand"
                required
                placeholder="Toyota, Honda, etc."
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
              <input
                type="text"
                name="model"
                required
                placeholder="Camry, Civic, etc."
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <input
                type="number"
                name="year"
                required
                min="1990"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Efficiency (km/l) *</label>
              <input
                type="number"
                name="mileage"
                required
                min="5"
                max="30"
                step="0.1"
                placeholder="e.g., 15.5, 20.0"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.mileage}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Fuel consumption in km per liter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
              <input
                type="number"
                name="expected_price"
                required
                min="0"
                placeholder="25000"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.expected_price}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Show seller info fields only if not logged in */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="seller_name"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.seller_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                <input
                  type="email"
                  name="seller_email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.seller_email}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellVehiclePage;