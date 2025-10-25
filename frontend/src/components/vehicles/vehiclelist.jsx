import React, { useState } from 'react';
import VehicleFilters from './VehicleFilters';

const VehicleList = () => {
  const [filters, setFilters] = useState({
    search: '',
    condition: 'all',
    fuelType: 'All Fuel Types',
    color: 'All Colors',
    transmission: 'All Transmissions',
    year: 'All Years',
    status: 'All Statuses',
    minPrice: '',
    maxPrice: '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  const handleApplyFilters = async (filters) => {
    try {
      setError(null);
      const queryParams = new URLSearchParams({
        ...(filters.search && { model: filters.search }),
        ...(filters.condition !== 'all' && { type: filters.condition }),
        ...(filters.fuelType !== 'All Fuel Types' && { fuel_type: filters.fuelType }),
        ...(filters.color !== 'All Colors' && { color: filters.color }),
        ...(filters.transmission !== 'All Transmissions' && { transmission: filters.transmission }),
        ...(filters.year !== 'All Years' && { year: filters.year }),
        ...(filters.status !== 'All Statuses' && { status: filters.status }),
        ...(filters.minPrice && { min_price: filters.minPrice }),
        ...(filters.maxPrice && { max_price: filters.maxPrice }),
      });

      const response = await fetch(`http://localhost:5000/api/vehicles?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setVehicles(data.vehicles);
        console.log('Vehicles:', data.vehicles, 'Count:', data.count);
      } else {
        setError(data.message || data.error || 'Failed to fetch vehicles');
      }
    } catch (error) {
      setError('Error fetching vehicles: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <VehicleFilters filters={filters} setFilters={setFilters} onApplyFilters={handleApplyFilters} />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <div key={vehicle.VehicleId} className="border rounded-lg p-4 shadow-sm">
              <img 
                src={vehicle.VehicleImageURL} 
                alt={vehicle.Model} 
                className="w-full h-48 object-cover rounded-md mb-2" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h3 className="text-lg font-semibold">{vehicle.Model}</h3>
              <p>Price: ${vehicle.BasePrice?.toLocaleString()}</p>
              <p>Type: {vehicle.Type}</p>
              <p>Fuel: {vehicle.FuelType}</p>
              <p>Transmission: {vehicle.Transmission}</p>
              <p>Color: {vehicle.Color}</p>
              <p>Year: {vehicle.Year}</p>
              <p>Status: {vehicle.StockStatus}</p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center">No vehicles found.</p>
        )}
      </div>
    </div>
  );
};

export default VehicleList;