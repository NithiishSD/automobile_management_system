import React, { useState, useEffect } from 'react';
import { Car, Bike, Calendar, Gauge, Package } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/Authcontext';
import LoadingSpinner from '../components/common/loadingspinner';

const VehicleDetailsPage = ({ vehicleId, navigateTo }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { user } = useAuth();

  // Map API vehicle data to frontend fields
  const mapVehicleData = (v) => ({
    id: v.VehicleId,
    brand: v.Model.split(' ')[0],
    model: v.Model,
    price: parseFloat(v.BasePrice),
    year: v.Year || null,
    type: v.Type === 'new' ? 'new' : 'resale',
    condition: v.Type === 'new' ? 'new' : 'used',
    mileage: v.Mileage || 0, // Optional if available
    status: v.StockStatus === 'In Stock' || v.StockStatus === 'Low Stock' ? 'available' : 'unavailable',
    description: `${v.Model} - ${v.Transmission} - ${v.FuelType}`,
    imageUrl: v.VehicleImageURL || '',
  });

  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      try {
        const data = await apiRequest('/vehicles');
        if (!data || !data.vehicles) {
          setVehicle(null);
        } else {
          const found = data.vehicles.find(v => v.VehicleId === vehicleId);
          setVehicle(found ? mapVehicleData(found) : null);
        }
      } catch (error) {
        console.error('Failed to load vehicle:', error);
        setVehicle(null);
      }
      setLoading(false);
    };

    if (vehicleId) loadVehicle();
  }, [vehicleId]);

  const handlePurchase = async () => {
    if (!user) {
      alert('Please login to purchase');
      navigateTo('login');
      return;
    }

    if (!vehicle) return;

    if (window.confirm(`Confirm purchase of ${vehicle.brand} ${vehicle.model} for $${vehicle.price}?`)) {
      setPurchasing(true);
      try {
        await apiRequest('/orders', {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: vehicle.id,
            quantity: 1,
            total_amount: vehicle.price,
          }),
        });
        alert('Order placed successfully!');
        navigateTo('orders');
      } catch (error) {
        alert('Failed to place order: ' + error.message);
      }
      setPurchasing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading vehicle details..." />;

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-xl text-gray-600 mb-4">Vehicle not found</p>
        <button onClick={() => navigateTo('vehicles')} className="text-blue-900 hover:underline">
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigateTo('vehicles')} 
        className="mb-6 text-blue-900 hover:underline flex items-center space-x-2"
      >
        <span>← Back to Vehicles</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Vehicle Image / Icon */}
          <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            {vehicle.type === 'new' ? (
              <Car className="h-40 w-40 text-blue-900" />
            ) : (
              <Bike className="h-40 w-40 text-blue-900" />
            )}
          </div>

          {/* Vehicle Details */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{vehicle.brand} {vehicle.model}</h1>
                {vehicle.year && <p className="text-gray-600">Year: {vehicle.year}</p>}
              </div>
              <span className={`px-3 py-1 rounded ${vehicle.condition.toLowerCase() === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {vehicle.condition.toUpperCase()}
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-900">${vehicle.price?.toLocaleString()}</span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="h-5 w-5 text-blue-900" />
                <span>Year: {vehicle.year || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Gauge className="h-5 w-5 text-blue-900" />
                <span>Mileage: {vehicle.mileage || 'N/A'} km</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Package className="h-5 w-5 text-blue-900" />
                <span>Type: {vehicle.type}</span>
              </div>
            </div>

            {vehicle.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{vehicle.description}</p>
              </div>
            )}

            {vehicle.status === 'available' ? (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400"
              >
                {purchasing ? 'Processing...' : 'Purchase Now'}
              </button>
            ) : (
              <div className="w-full bg-red-100 text-red-800 py-3 rounded-lg text-center font-semibold">
                Not Available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
