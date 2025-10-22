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
    description: '',
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
      await apiRequest('/sell', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setMessage('Your vehicle has been submitted for review! We will contact you soon.');
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Sell Your Vehicle</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">
          Fill out the form below and our team will review your vehicle. We'll contact you with an offer within 24 hours.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('submitted') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                required
                placeholder="e.g., Toyota, Honda"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                required
                placeholder="e.g., Camry, CBR"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mileage (km)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g., 50000"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price ($)</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g., 25000"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.expected_price}
              onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows="4"
              placeholder="Describe your vehicle's condition, features, and any additional details..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellVehiclePage;
