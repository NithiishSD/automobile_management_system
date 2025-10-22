import React from 'react';
import { Search, Filter } from 'lucide-react';

const VehicleFilters = ({ filters, setFilters }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by brand or model..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="car">Cars</option>
          <option value="bike">Bikes</option>
        </select>
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.condition}
          onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
        >
          <option value="all">All Conditions</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>
        <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center justify-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
};

export default VehicleFilters;
