import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiRequest } from '../services/api';
import LoadingSpinner from '../components/common/loadingspinner';

const OrdersPage = ({ viewVehicleDetails }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const savedUser =  JSON.parse(localStorage.getItem('user'));
    console.log(savedUser)
    let username=savedUser.username
    console.log(username)
    if (!username) throw new Error("User not found");
    try{
        const data = await apiRequest(`/bookings?user=${encodeURIComponent(username)}`);
        
        setOrders(data.orders || data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Order #{order.id}</h3>
                  <p className="text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="font-semibold capitalize">{order.status}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-semibold">{order.vehicle_name || 'Vehicle Details'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-blue-900">${order.total_amount?.toLocaleString()}</p>
                  </div>
                </div>

                {order.vehicle_id && (
                  <button
                    onClick={() => viewVehicleDetails(order.vehicle_id)}
                    className="text-blue-900 hover:underline"
                  >
                    View Vehicle Details
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

export default OrdersPage;
