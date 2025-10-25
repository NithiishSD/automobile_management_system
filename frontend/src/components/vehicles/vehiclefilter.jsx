import React, { useEffect, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const VehicleFilters = ({ filters, setFilters, onApplyFilters }) => {
  // State for filter options
  const [options, setOptions] = useState({
    fuelTypes: ['All Fuel Types'],
    colors: ['All Colors'],
    transmissions: ['All Transmissions'],
    years: ['All Years'],
    statuses: ['All Statuses'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch filter options from API
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/vehicle-options');
        if (!response.ok) {
          throw new Error('Failed to fetch filter options');
        }
        const data = await response.json();
        
        setOptions({
          fuelTypes: ['All Fuel Types', ...(data.fuelTypes || [])],
          colors: ['All Colors', ...(data.colors || [])],
          transmissions: ['All Transmissions', ...(data.transmissions || [])],
          years: ['All Years', ...(data.years || [])],
          statuses: ['All Statuses', ...(data.statuses || [])],
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
        setError('Failed to load filter options. Using default options.');
        // Fallback to static options based on your database
        setOptions({
          fuelTypes: ['All Fuel Types', 'Petrol', 'Diesel', 'Electric'],
          colors: ['All Colors', 'Pearl White', 'Midnight Black'],
          transmissions: ['All Transmissions', 'Manual', 'Automatic'],
          years: ['All Years', '2020', '2021', '2022', '2023', '2024', '2025'],
          statuses: ['All Statuses', 'In Stock', 'Low Stock', 'Resale'],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Handle price input validation
  const handlePriceChange = (key, value) => {
    const numValue = value === '' ? '' : Math.max(0, Number(value));
    setFilters({ ...filters, [key]: numValue });
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilters({
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
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-lg font-semibold mb-4">Filter Vehicles</h2>
      {error && <div className="text-yellow-600 bg-yellow-50 p-3 rounded mb-4 text-sm">{error}</div>}
      {loading && <div className="text-gray-500 mb-4">Loading filter options...</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Search by Model */}
        <div className="relative">
          <label htmlFor="search" className="sr-only">Search by model</label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="search"
            type="text"
            placeholder="Search by model..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            aria-label="Search by model"
            disabled={loading}
          />
        </div>

        {/* Condition Filter */}
        <div>
          <label htmlFor="condition" className="sr-only">Condition</label>
          <select
            id="condition"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.condition}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
            aria-label="Vehicle condition"
            disabled={loading}
          >
            <option value="all">All Conditions</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        {/* Fuel Type Filter */}
        <div>
          <label htmlFor="fuelType" className="sr-only">Fuel Type</label>
          <select
            id="fuelType"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.fuelType}
            onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
            aria-label="Fuel Type"
            disabled={loading}
          >
            {options.fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Color Filter */}
        <div>
          <label htmlFor="color" className="sr-only">Color</label>
          <select
            id="color"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.color}
            onChange={(e) => setFilters({ ...filters, color: e.target.value })}
            aria-label="Color"
            disabled={loading}
          >
            {options.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Transmission Filter */}
        <div>
          <label htmlFor="transmission" className="sr-only">Transmission</label>
          <select
            id="transmission"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.transmission}
            onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
            aria-label="Transmission"
            disabled={loading}
          >
            {options.transmissions.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label htmlFor="year" className="sr-only">Year</label>
          <select
            id="year"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            aria-label="Year of Manufacture"
            disabled={loading}
          >
            {options.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="sr-only">Stock Status</label>
          <select
            id="status"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            aria-label="Stock Status"
            disabled={loading}
          >
            {options.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price Range Filter */}
        <div>
          <label htmlFor="minPrice" className="sr-only">Minimum Price</label>
          <input
            id="minPrice"
            type="number"
            placeholder="Min Price"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            min="0"
            aria-label="Minimum Price"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="sr-only">Maximum Price</label>
          <input
            id="maxPrice"
            type="number"
            placeholder="Max Price"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            min="0"
            aria-label="Maximum Price"
            disabled={loading}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex justify-end space-x-4">
        <button
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition flex items-center justify-center space-x-2 disabled:bg-gray-300"
          onClick={resetFilters}
          disabled={loading}
        >
          <X className="h-5 w-5" />
          <span>Reset Filters</span>
        </button>
        <button
          className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center justify-center space-x-2 disabled:bg-blue-300"
          onClick={() => onApplyFilters(filters)}
          disabled={loading}
        >
          <Filter className="h-5 w-5" />
          <span>Apply Filters</span>
        </button>
      </div>
    </div>
  );
};

export default VehicleFilters;