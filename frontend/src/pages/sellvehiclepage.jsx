import React, { useState } from 'react';
import { useAuth } from '../context/Authcontext';
import { apiRequest } from '../services/api';

const SellVehiclePage = ({ navigateTo }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'car',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'used',
    mileage: '',
    expected_price: '',
    description: '', // Optional field
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to sell your vehicle');
      navigateTo('login');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await apiRequest('/sell', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      setMessage(response.message || 'Your vehicle has been submitted for review! We will contact you soon.');
      
      // Reset form
      setFormData({
        type: 'car',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        condition: 'used',
        mileage: '',
        expected_price: '',
        description: '',
      });
    } catch (error) {
      setMessage('Failed to submit: ' + error.message);
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Sell Your Vehicle</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">
          Fill out the form below and our team will review your vehicle. We'll contact you with an offer within 24 hours.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('submitted') || message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                name="type"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="car">Car</option>
                <option value="bike">Motorcycle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                name="condition"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
              <input
                type="text"
                name="brand"
                required
                placeholder="e.g., Toyota, Honda, BMW"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="e.g., Camry, Civic, X5"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <input
                type="number"
                name="year"
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.year}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km) *</label>
              <input
                type="number"
                name="mileage"
                required
                min="0"
                placeholder="e.g., 50000"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.mileage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price ($) *</label>
            <input
              type="number"
              name="expected_price"
              required
              min="0"
              step="100"
              placeholder="e.g., 25000"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.expected_price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="Any additional information about your vehicle's condition, features, or service history..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellVehiclePage;