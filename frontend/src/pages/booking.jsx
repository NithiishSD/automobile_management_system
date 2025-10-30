import React, { useState, useEffect } from 'react';
import { Car, Bike, Calendar, User, Phone, Mail, CreditCard, CheckCircle } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/Authcontext';
import LoadingSpinner from '../components/common/loadingspinner';

const BookingPage = ({ vehicleId, navigateTo }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  
  const [bookingData, setBookingData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    booking_date: new Date().toISOString().split('T')[0],
    test_drive: false,
    payment_method: 'full',
    down_payment: '',
    special_requests: '',
  });

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
    if (user) {
      setBookingData(prev => ({
        ...prev,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.phone || '',
      }));
    }
  }, [vehicleId, user]);

  const loadVehicle = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/vehicles/${vehicleId}`);
      setVehicle(data.vehicle || data);
    } catch (error) {
      console.error('Failed to load vehicle:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bookingPayload = {
        vehicle_id: vehicle.id,
        ...bookingData,
        total_amount: bookingData.payment_method === 'full' 
          ? vehicle.price 
          : parseFloat(bookingData.down_payment),
      };

      await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload),
      });

      alert('Booking confirmed! Check your email for details.');
      navigateTo('my-bookings');
    } catch (error) {
      alert('Failed to create booking: ' + error.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading vehicle details..." />;
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

  const downPaymentAmount = bookingData.payment_method === 'down_payment' 
    ? parseFloat(bookingData.down_payment) || 0 
    : vehicle.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigateTo('vehicle-details')} 
        className="mb-6 text-blue-900 hover:underline"
      >
        ← Back to Vehicle Details
      </button>

      <h1 className="text-4xl font-bold mb-8">Book Your Vehicle</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Vehicle Summary</h2>
            
            <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
              {vehicle.type === 'car' ? (
                <Car className="h-20 w-20 text-blue-900" />
              ) : (
                <Bike className="h-20 w-20 text-blue-900" />
              )}
            </div>

            <h3 className="text-xl font-bold mb-2">{vehicle.brand} {vehicle.model}</h3>
            <p className="text-gray-600 mb-4">Year: {vehicle.year}</p>
            
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Vehicle Price:</span>
                <span className="font-bold">${vehicle.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-semibold capitalize">{bookingData.payment_method.replace('_', ' ')}</span>
              </div>
              {bookingData.payment_method === 'down_payment' && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-bold text-blue-900">${downPaymentAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Amount to Pay:</span>
                <span className="font-bold text-blue-900 text-2xl">
                  ${downPaymentAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingData.customer_name}
                      onChange={(e) => setBookingData({ ...bookingData, customer_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingData.customer_email}
                      onChange={(e) => setBookingData({ ...bookingData, customer_email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingData.customer_phone}
                      onChange={(e) => setBookingData({ ...bookingData, customer_phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={bookingData.booking_date}
                      onChange={(e) => setBookingData({ ...bookingData, booking_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Test Drive Option */}
              <div className="border-t pt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-500"
                    checked={bookingData.test_drive}
                    onChange={(e) => setBookingData({ ...bookingData, test_drive: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    I would like to schedule a test drive before purchase
                  </span>
                </label>
              </div>

              {/* Payment Method */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="full"
                      checked={bookingData.payment_method === 'full'}
                      onChange={(e) => setBookingData({ ...bookingData, payment_method: e.target.value })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Full Payment</div>
                      <div className="text-sm text-gray-600">Pay the complete amount now</div>
                    </div>
                    <div className="font-bold text-blue-900">${vehicle.price.toLocaleString()}</div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="down_payment"
                      checked={bookingData.payment_method === 'down_payment'}
                      onChange={(e) => setBookingData({ ...bookingData, payment_method: e.target.value })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Down Payment</div>
                      <div className="text-sm text-gray-600">Pay partial amount to book</div>
                    </div>
                  </label>

                  {bookingData.payment_method === 'down_payment' && (
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment Amount (minimum 20%) *
                      </label>
                      <input
                        type="number"
                        required
                        min={vehicle.price * 0.2}
                        max={vehicle.price}
                        step="100"
                        placeholder={`Minimum $${(vehicle.price * 0.2).toLocaleString()}`}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={bookingData.down_payment}
                        onChange={(e) => setBookingData({ ...bookingData, down_payment: e.target.value })}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Remaining: ${(vehicle.price - (parseFloat(bookingData.down_payment) || 0)).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows="4"
                  placeholder="Any special requirements or notes..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingData.special_requests}
                  onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="border-t pt-6">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 mt-1 text-blue-900 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the terms and conditions and understand that this booking is subject to vehicle availability *
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-900 text-white py-4 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400 flex items-center justify-center space-x-2 text-lg font-semibold"
              >
                {submitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
