import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import LoadingSpinner from '../components/common/loadingspinner';
import VehicleCard from '../components/vehicles/vehiclecard';
import VehicleFilters from '../components/vehicles/vehiclefilter';

const VehiclesPage = ({ viewVehicleDetails }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', condition: 'all', search: '' });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/vehicles');
      setVehicles(data.vehicles || data || []);
      console.log('Vehicles loaded:', data.vehicles);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setVehicles([]);
    }
    setLoading(false);
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesType = filters.type === 'all' || v.type === filters.type;
    const matchesCondition = filters.condition === 'all' || v.condition === filters.condition;
    const matchesSearch = !filters.search || 
      v.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
      v.model?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesCondition && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Browse Vehicles</h1>

      <VehicleFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <LoadingSpinner message="Loading vehicles..." />
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No vehicles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onViewDetails={viewVehicleDetails} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
