import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/Authcontext';


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
    transmission: 'Manual',
    fuel_type: 'Petrol',
    accident_history: 'None reported',
    description: '',
    seller_name: user?.username || '',
    seller_email: user?.email || '',
    color:'',
    // Extra history fields
    HistoryId: '',
    VehicleId: '',
    RecordDate: new Date().toISOString().split('T')[0],
    OilCondition: '',
    VehicleCondition: '',
    RunKilometers: '',
    ServiceRemarks: '',
    NumOfOwners: 1,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect function for login
  const redirectToLogin = () => {
    navigateTo('login');
  };

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.brand || !formData.model || !formData.mileage || !formData.expected_price) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');

      setMessage(data.message || 'Your vehicle has been submitted for review! We will contact you soon.');
      setFormData({
        ...formData,
        brand: '',
        model: '',
        mileage: '',
        expected_price: '',
        OilCondition: '',
        VehicleCondition: '',
        RunKilometers: '',
        ServiceRemarks: '',
        NumOfOwners: 1,
      });
    } catch (error) {
      setMessage('❌ ' + (error.message || 'Submission failed.'));
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Sell Your Vehicle</h1>

      {!user ? (
        // If not logged in, show this section
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-lg text-center">
          <p className="text-yellow-800 text-lg font-semibold mb-4">
            You must be logged in to sell your vehicle.
          </p>
          <button
            onClick={redirectToLogin}
            className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800"
          >
            Go to Login
          </button>
        </div>
      ) : (
        // If logged in, show form
        <div className="bg-white rounded-lg shadow-lg p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('✅')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
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
                  className="w-full px-4 py-2 border rounded-lg"
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
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.condition}
                  onChange={handleChange}
                >
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
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.model}
                  onChange={handleChange}
                />
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
                        <option value="Hybrid">Hybrid</option>
                        <option value="CNG">CNG</option>
                      </select>
                    </div>
                    <div>
  <label className="block mb-1 font-medium">Vehicle Color</label>
  <input
    type="text"
    name="color"
    value={formData.color}
    onChange={handleChange}
    placeholder="Enter vehicle color"
    className="border p-2 rounded w-full"
    required
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Efficiency (km/l) *
                </label>
                <input
                  type="number"
                  name="mileage"
                  required
                  min="5"
                  max="30"
                  step="0.1"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.mileage}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (&#8377;) *</label>
                <input
                  type="number"
                  name="expected_price"
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.expected_price}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Extra Vehicle History Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Oil Condition</label>
                      <select
                        name="OilCondition"
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.OilCondition}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Needs Change">Needs Change</option>
                      </select>
                    </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                  <select
                    name="transmission"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.transmission}
                    onChange={handleChange}
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="AMT">AMT</option>
                    <option value="CVT">CVT</option>
                    <option value="DCT">Dual-Clutch (DCT)</option>
                  </select>
                </div>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Run Kilometers
                </label>
                <input
                  type="number"
                  name="RunKilometers"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.RunKilometers}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Owners
                </label>
                <input
                  type="number"
                  name="NumOfOwners"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.NumOfOwners}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Remarks
              </label>
              <textarea
                name="ServiceRemarks"
                rows="3"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.ServiceRemarks}
                placeholder="For example:Oil changed at 45,000 km,Replaced brake pads on 2025-01-10,Next service due in 3 months"
                onChange={handleChange}
              ></textarea>
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
      )}
    </div>
  );
};

export default SellVehiclePage;
