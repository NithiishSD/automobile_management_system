import React, { useState, useEffect } from 'react';
import { Car, Bike, Calendar, Gauge, Package, Users, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/Authcontext';
import LoadingSpinner from '../components/common/loadingspinner';


const handleBookNow = () => {
  if (!user) {
    alert('Please login to book this vehicle');
    navigateTo('login');
    return;
  }
  navigateTo('booking');
};
const VehicleDetailsPage = ({ vehicleId, navigateTo }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const { user } = useAuth();

  // Map API vehicle data to frontend fields
  const mapVehicleData = (v) => ({
    id: v.VehicleId,
    vin: v.Vin,
    brand: v.Model?.split(' ')[0] || 'Unknown',
    model: v.Model,
    price: parseFloat(v.BasePrice) || 0,
    cost: parseFloat(v.Cost) || 0,
    year: v.Year || null,
    type: v.Type === 'new' ? 'new' : 'resale',
    condition: v.VehicleCondition || (v.Type === 'new' ? 'new' : 'used'),
    fuelType: v.FuelType || 'N/A',
    transmission: v.Transmission || 'N/A',
    drivetrain: v.drivetrain || 'N/A',
    cylinders: v.cylinders || 'N/A',
    mileage: v.Mileage || 0,
    color: v.Color || 'N/A',
    warrantyPeriod: v.WarrantyPeriod || 0,
    stockStatus: v.StockStatus || 'Unknown',
    quantity: v.quantity || 0,
    location: v.Location || 'N/A',
    manufacturer: v.ManufacturerName || 'N/A',
    imageUrl: v.VehicleImageURL || '',
    // History fields for used vehicles
    oilCondition: v.OilCondition,
    historyCondition: v.HistoryCondition,
    runKilometers: v.RunKilometers,
    serviceRemarks: v.ServiceRemarks,
    accidentHistory: v.AccidentHistory,
    numOfOwners: v.NumOfOwners || 1,
  });

  useEffect(() => {
    const loadVehicle = async () => {
      if (!vehicleId) {
        setError('No vehicle ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading vehicle with ID:', vehicleId);
        // Use the correct endpoint - remove /api since it's already in base URL
        const data = await apiRequest(`/vehicles/${vehicleId}`);
        console.log('Vehicle data received:', data);
        setVehicle(mapVehicleData(data));
      } catch (error) {
        console.error('Failed to load vehicle:', error);
        setError(`Failed to load vehicle details: ${error.message}`);
        setVehicle(null);
      }
      setLoading(false);
    };

    loadVehicle();
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
        await apiRequest('/bookings', {
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-xl text-gray-600 mb-4">{error}</p>
        <button onClick={() => navigateTo('vehicles')} className="text-blue-900 hover:underline">
          Back to Vehicles
        </button>
      </div>
    );
  }

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

  const isAvailable = vehicle.stockStatus === 'In Stock' || vehicle.stockStatus === 'Low Stock';

  const isNewVehicle = vehicle.type === 'new';
  console.log(vehicle)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigateTo('vehicles')} 
        className="mb-6 text-blue-900 hover:underline flex items-center space-x-2"
      >
        <span>← Back to Vehicles</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Vehicle Image */}
          <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-8">
            {vehicle.imageUrl ? (
              <img 
                src={vehicle.imageUrl} 
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // The fallback icon will show since the img is hidden
                }}
              />
            ) : isNewVehicle ? (
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
                <p className="text-gray-600">VIN: {vehicle.vin}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <span className={`px-3 py-1 rounded text-sm ${vehicle.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {vehicle.condition.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded text-sm ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {vehicle.stockStatus}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-900">${vehicle.price.toLocaleString()}</span>
              {vehicle.cost && (
                <p className="text-sm text-gray-500">Cost: ${vehicle.cost.toLocaleString()}</p>
              )}
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="h-5 w-5 text-blue-900" />
                <span>Year: {vehicle.year || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Package className="h-5 w-5 text-blue-900" />
                <span>Fuel: {vehicle.fuelType}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Gauge className="h-5 w-5 text-blue-900" />
                <span>Transmission: {vehicle.transmission}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Package className="h-5 w-5 text-blue-900" />
                <span>Color: {vehicle.color}</span>
              </div>
              {vehicle.drivetrain && vehicle.drivetrain !== 'N/A' && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <Package className="h-5 w-5 text-blue-900" />
                  <span>Drivetrain: {vehicle.drivetrain}</span>
                </div>
              )}
              {vehicle.cylinders && vehicle.cylinders !== 'N/A' && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <Package className="h-5 w-5 text-blue-900" />
                  <span>Cylinders: {vehicle.cylinders}</span>
                </div>
              )}
              {vehicle.mileage > 0 && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <Gauge className="h-5 w-5 text-blue-900" />
                  <span>Mileage: {vehicle.mileage} kmpl</span>
                </div>
              )}
            </div>

            {/* Additional Info for Used Vehicles */}
            {!isNewVehicle && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Vehicle History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>Previous Owners: {vehicle.numOfOwners}</p>
                  {vehicle.runKilometers && <p>Kilometers: {vehicle.runKilometers.toLocaleString()}</p>}
                  {vehicle.oilCondition && <p>Oil Condition: {vehicle.oilCondition}</p>}
                  <p>Accident History: {vehicle.accidentHistory || 'None'}</p>
                  {vehicle.serviceRemarks && <p>Service Remarks: {vehicle.serviceRemarks}</p>}
                </div>
              </div>
            )}

            {/* Warranty Info for New Vehicles */}
            {isNewVehicle && vehicle.warrantyPeriod && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Warranty Information</h3>
                <p className="text-sm text-green-700">{vehicle.warrantyPeriod} year warranty included</p>
              </div>
            )}

            {/* Inventory Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Inventory</h3>
              <p className="text-sm text-blue-700">
                {vehicle.quantity} available 
              </p>
            </div>

            {/* Manufacturer Info */}
            {vehicle.manufacturer && vehicle.manufacturer !== 'N/A' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Manufacturer</h3>
                <p className="text-sm text-gray-700">{vehicle.manufacturer}</p>
              </div>
            )}

            {/* Purchase Button */}
            {isAvailable ? (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400 font-semibold"
              >
                {purchasing ? 'Processing Purchase...' : 'Purchase Now'}
              </button>
            ) : (
              <div className="w-full bg-red-100 text-red-800 py-3 rounded-lg text-center font-semibold">
                Currently Not Available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
