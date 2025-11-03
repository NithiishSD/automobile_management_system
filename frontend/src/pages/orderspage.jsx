import React, { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  CreditCard,
} from "lucide-react";
import { apiRequest } from "../services/api";
import LoadingSpinner from "../components/common/loadingspinner";

const OrdersPage = ({ viewVehicleDetails }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const username = savedUser?.username;
      if (!username) throw new Error("User not found");

      const data = await apiRequest(`/orders?user=${encodeURIComponent(username)}`);
      setOrders(data.orders || data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Package className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your orders..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold mb-10 text-blue-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">You haven’t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on{" "}
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold text-gray-900">
                    {order.vehicle_name || "Vehicle Info"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-blue-900">
                    ₹{order.total_amount?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Mode</p>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    {order.payment_mode || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Delivery Date</p>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Truck className="h-4 w-4 text-gray-500" />
                    {order.delivery_date
                      ? new Date(order.delivery_date).toLocaleDateString()
                      : "Awaiting confirmation"}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-semibold text-gray-900">
                    #{order.booking_ref || "—"}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {order.vehicle_id && (
                  <button
                    onClick={() => viewVehicleDetails(order.vehicle_id)}
                    className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
                  >
                    View Vehicle
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                  Download Invoice
                </button>
                {order.status !== "cancelled" && (
                  <button className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition">
                    Cancel Order
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
