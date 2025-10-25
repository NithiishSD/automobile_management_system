import React, { useState, useEffect } from 'react';
import { Calendar, Package, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { apiRequest } from '../services/api';
import LoadingSpinner from '../components/common/loadingspinner';

const MyBookingsPage = ({ viewVehicleDetails, navigateTo }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/bookings');
      setBookings(data.bookings || data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.color} flex items-center space-x-1`}>
        <Icon className="h-4 w-4" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading your bookings..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-4">No bookings yet</p>
          <button
            onClick={() => navigateTo('vehicles')}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Browse Vehicles
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Booking #{booking.id}</h3>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Booked on: {new Date(booking.booking_date).toLocaleDateString()}</span>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold">{booking.vehicle_name || 'Vehicle Details'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold capitalize">{booking.payment_method?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="font-semibold text-blue-900">${booking.total_amount?.toLocaleString()}</p>
                </div>
              </div>

              {booking.test_drive && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold">
                    ✓ Test drive requested
                  </p>
                </div>
              )}

              <div className="mt-4 flex space-x-3">
                {booking.vehicle_id && (
                  <button
                    onClick={() => viewVehicleDetails(booking.vehicle_id)}
                    className="flex items-center space-x-2 text-blue-900 hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Vehicle</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
