import React, { useState } from 'react';
import { apiRequest } from '../services/api';

const SellVehiclePage = () => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'good',
    mileage: '',
    expected_price: '',
    transmission: 'Manual',
    fuel_type: 'Petrol',
    accident_history: 'None reported',
    description: '',
    seller_name: '',
    seller_email: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.brand || !formData.model || !formData.mileage || !formData.expected_price) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await apiRequest('/sell', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      setMessage(response.message);
      
      // Reset form on success
      if (!response.error) {
        setFormData({
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          condition: 'good',
          mileage: '',
          expected_price: '',
          transmission: 'Manual',
          fuel_type: 'Petrol',
          accident_history: 'None reported',
          description: '',
          seller_name: '',
          seller_email: '',
        });
      }
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
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Sell Your Vehicle</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mileage *</label>
              <input
                type="number"
                name="mileage"
                required
                min="0"
                placeholder="50000"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.mileage}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                name="condition"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
              <select
                name="fuel_type"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.fuel_type}
                onChange={handleChange}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>

          {/* Seller Info */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Any additional details..."
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

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