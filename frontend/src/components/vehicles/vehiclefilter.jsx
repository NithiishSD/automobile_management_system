import React from 'react';
import { Search, Filter } from 'lucide-react';

const VehicleFilters = ({ filters, setFilters }) => {
  // Sample options derived from database
  const manufacturers = ['All Manufacturers', 'Honda India Pvt Ltd', 'Hyundai Motors India'];
  const fuelTypes = ['All Fuel Types', 'Petrol', 'Diesel', 'Electric'];
  const colors = ['All Colors', 'Pearl White', 'Midnight Black'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search by Model or Manufacturer */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by model or manufacturer..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Condition Filter */}
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.condition}
          onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
        >
          <option value="all">All Conditions</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>

        {/* Manufacturer Filter */}
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.manufacturer}
          onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
        >
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>

        {/* Fuel Type Filter */}
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.fuelType}
          onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
        >
          {fuelTypes.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      {/* Color Filter */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.color}
          onChange={(e) => setFilters({ ...filters, color: e.target.value })}
        >
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        {/* Price Range Filter */}
        <input
          type="number"
          placeholder="Min Price"
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          type="number"
          placeholder="Max Price"
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
      </div>

      {/* Filter Button */}
      <div className="mt-4 flex justify-end">
        <button
          className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center justify-center space-x-2"
          onClick={() => console.log('Applying filters:', filters)}
        >
          <Filter className="h-5 w-5" />
          <span>Apply Filters</span>
        </button>
      </div>
    </div>
  );
};

export default VehicleFilters;