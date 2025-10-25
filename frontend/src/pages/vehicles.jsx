import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import LoadingSpinner from '../components/common/loadingspinner';
import VehicleCard from '../components/vehicles/vehiclecard';
import VehicleFilters from '../components/vehicles/vehiclefilter';

const VehiclesPage = ({ viewVehicleDetails }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    search: '',
    condition: 'all',
    fuelType: 'All Fuel Types',
    color: 'All Colors',
    transmission: 'All Transmissions',
    year: 'All Years',
    status: 'All Statuses',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async (filterParams = {}) => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      console.log('Filter parameters received:', filterParams);
      
      // Map frontend filter names to backend parameter names
      if (filterParams.type) {
        queryParams.append('type', filterParams.type);
      }
      if (filterParams.model) {
        queryParams.append('model', filterParams.model);
      }
      if (filterParams.fuel_type) {
        queryParams.append('fuel_type', filterParams.fuel_type);
      }
      if (filterParams.transmission) {
        queryParams.append('transmission', filterParams.transmission);
      }
      if (filterParams.color) {
        queryParams.append('color', filterParams.color);
      }
      if (filterParams.year) {
        queryParams.append('year', filterParams.year);
      }
      if (filterParams.status) {
        queryParams.append('status', filterParams.status);
      }
      if (filterParams.min_price) {
        queryParams.append('min_price', filterParams.min_price);
      }
      if (filterParams.max_price) {
        queryParams.append('max_price', filterParams.max_price);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/vehicles?${queryString}` : '/vehicles';
      
      console.log('Making API request to:', url);
      const data = await apiRequest(url);
      console.log('API response:', data);
      
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setVehicles([]);
    }
    setLoading(false);
  };

  const handleApplyFilters = (newFilters) => {
    const apiFilters = {
      type: newFilters.condition !== 'all' ? newFilters.condition : undefined,
      model: newFilters.search || undefined,
      fuel_type: newFilters.fuelType !== 'All Fuel Types' ? newFilters.fuelType : undefined,
      transmission: newFilters.transmission !== 'All Transmissions' ? newFilters.transmission : undefined,
      color: newFilters.color !== 'All Colors' ? newFilters.color : undefined,
      year: newFilters.year !== 'All Years' ? newFilters.year : undefined,
      status: newFilters.status !== 'All Statuses' ? newFilters.status : undefined,
      min_price: newFilters.minPrice || undefined,
      max_price: newFilters.maxPrice || undefined
    };

    // Remove undefined values
    Object.keys(apiFilters).forEach(key => {
      if (apiFilters[key] === undefined) {
        delete apiFilters[key];
      }
    });

    console.log('Sending filters to API:', apiFilters);
    loadVehicles(apiFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Browse Vehicles</h1>

      <VehicleFilters 
        filters={filters} 
        setFilters={setFilters} 
        onApplyFilters={handleApplyFilters} 
      />

      {loading ? (
        <LoadingSpinner message="Loading vehicles..." />
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No vehicles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.VehicleId} 
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