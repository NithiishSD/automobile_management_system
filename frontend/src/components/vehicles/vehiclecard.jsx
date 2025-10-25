import React from 'react';
import { Car, Bike, Eye } from 'lucide-react';

const VehicleCard = ({ vehicle, onViewDetails }) => {
  const mapVehicleData = (v) => ({
    id: v.VehicleId,
    brand: v.Model?.split(' ')[0] || 'Unknown',
    model: v.Model,
    price: parseFloat(v.BasePrice) || 0,
    year: v.Year || null,
    type: v.Type === 'new' ? 'new' : 'resale',
    condition: v.Type === 'new' ? 'new' : 'used',
    status: v.StockStatus === 'In Stock' || v.StockStatus === 'Low Stock' ? 'available' : 'unavailable',
    imageUrl: v.VehicleImageURL || '',
  });

  const mappedVehicle = mapVehicleData(vehicle);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        {mappedVehicle.imageUrl ? (
          <img 
            src={mappedVehicle.imageUrl} 
            alt={`${mappedVehicle.brand} ${mappedVehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : mappedVehicle.type === 'new' ? (
          <Car className="h-16 w-16 text-blue-900" />
        ) : (
          <Bike className="h-16 w-16 text-blue-900" />
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{mappedVehicle.brand} {mappedVehicle.model}</h3>
          <span className={`px-2 py-1 text-xs rounded ${mappedVehicle.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {mappedVehicle.condition.toUpperCase()}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{mappedVehicle.year}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-900">${mappedVehicle.price?.toLocaleString()}</span>
          <span className={`px-2 py-1 text-xs rounded ${mappedVehicle.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {mappedVehicle.status.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => onViewDetails(mappedVehicle.id)}
          className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition flex items-center justify-center space-x-2"
        >
          <Eye className="h-5 w-5" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;