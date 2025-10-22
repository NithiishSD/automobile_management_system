import React from 'react';
import { Car, Bike, Eye } from 'lucide-react';

const VehicleCard = ({ vehicle, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        {vehicle.type === 'car' ? (
          <Car className="h-20 w-20 text-blue-900" />
        ) : (
          <Bike className="h-20 w-20 text-blue-900" />
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h3>
          <span className={`px-2 py-1 text-xs rounded ${vehicle.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {vehicle.condition?.toUpperCase()}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{vehicle.year}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-900">${vehicle.price?.toLocaleString()}</span>
          <span className={`px-2 py-1 text-xs rounded ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {vehicle.status?.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => onViewDetails(vehicle.id)}
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
