import React, { useState, useEffect } from "react";
import {
  Package,
  Car,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Trash2,
} from "lucide-react";
import { apiRequest } from "../services/api";
import LoadingSpinner from "../components/common/loadingspinner";

const MyBookingsPage = ({ viewVehicleDetails }) => {
  const [bookings, setBookings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      const username = savedUser?.username;
      if (!username) throw new Error("User not found");

      // Fetch bookings
      const bookingsData = await apiRequest(`/bookings?user=${encodeURIComponent(username)}`);
      setBookings(bookingsData.bookings || bookingsData || []);

      // Fetch sales
      const salesData = await apiRequest(`/sales?user=${encodeURIComponent(username)}`);
      setSales(salesData.sales || salesData || []);
    } catch (error) {
      console.error("Error loading booking/sales data:", error);
      setBookings([]);
      setSales([]);
    }
    setLoading(false);
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    try {
      const res = await apiRequest(`/cancel_booking/${bookingId}`, { method: "POST" });
      alert(res.message || "Booking cancelled successfully!");
      await loadData();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking.");
    }
    setActionLoading(false);
  };

  const cancelSale = async (saleId) => {
    if (!window.confirm("Do you really want to cancel your sale listing?")) return;
    setActionLoading(true);
    try {
      const res = await apiRequest(`/cancel_sale/${saleId}`, { method: "POST" });
      alert(res.message || "Sale request cancelled!");
      await loadData();
    } catch (error) {
      console.error("Error cancelling sale:", error);
      alert("Failed to cancel sale.");
    }
    setActionLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "approved":
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
      case "under review":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) return <LoadingSpinner message="Loading your bookings and sales..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <h1 className="text-4xl font-bold mb-6 text-blue-900">My Vehicle Activity</h1>

      {/* --- BOOKINGS SECTION --- */}
      <section>
  <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b pb-3">
    My Bookings
  </h2>

  {bookings.length === 0 ? (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
      <Package className="h-14 w-14 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 text-lg font-medium">
        You haven’t booked any vehicles yet.
      </p>
    </div>
  ) : (
    <div className="space-y-8">
      {bookings.map((b) => (
        <div
          key={b.bookid}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
        >
          {/* Header Section */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {b.brand} {b.model}
              </h3>
              <p className="text-sm text-gray-500">
                Booking ID: #{b.bookid}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(b.status)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  b.status?.toLowerCase() === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : b.status?.toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {b.status || "Pending"}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>Color:</strong> {b.color || "N/A"}
            </p>
            <p>
              <strong>Payment Mode:</strong>{" "}
              {b.payment_mode || "Not Selected"}
            </p>
            <p>
              <strong>Booking Date:</strong>{ new Date(b.booking_date).toLocaleString()}
              
            </p>
            <p>
              <strong>expiry Date:</strong>{" "}
              {b.delivery_date
                ? new Date(b.delivery_date).toLocaleDateString()
                : "TBD"}
            </p>
            <p>
              <strong>Price:</strong>{" "}
              {b.total_amount ? `₹${b.total_amount.toLocaleString()}` : "N/A"}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              {b.payment_status || "Not Paid"}
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => viewVehicleDetails(b.vehicle_id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Vehicle Details
            </button>

            {b.status?.toLowerCase() === "pending" && (
              <button
                onClick={() => cancelBooking(b.bookid)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" /> Cancel Booking
              </button>
            )}

            {b.payment_mode?.toLowerCase() === "online" && (
              <button
                onClick={() => handleOnlinePayment(b.bookid)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Pay Online
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>

      {/* --- SALES SECTION --- */}
      <section>
  <h2 className="text-2xl font-semibold mb-4">My Vehicle Sales</h2>
  {sales.length === 0 ? (
    <div className="text-center py-10 bg-white rounded-lg shadow">
      <Car className="h-12 w-12 mx-auto text-gray-400 mb-3" />
      <p className="text-gray-600 text-lg">No vehicle sales recorded</p>
    </div>
  ) : (
    <div className="space-y-6">
      {sales.map((s) => (
        <div key={s.saleid} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">
                {s.brand} - {s.model}
              </h3>
              <p className="text-gray-600 text-sm">
                Listed on: {s.date_listed}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(s.status)}
              <span
                className={`capitalize font-medium ${
                  s.status === "Verified"
                    ? "text-green-700"
                    : s.status === "Rejected"
                    ? "text-red-700"
                    : "text-yellow-700"
                }`}
              >
                {s.status}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-700">Color: {s.color}</p>

          {/* Show Base Price if Verified */}
          {s.status === "Verified" && (
            <p className="text-sm text-gray-700">
              Base Price (set by shop): ₹{s.base_price || "N/A"}
            </p>
          )}

          {/* Show Payment Status if Verified */}
          {s.status === "Verified" && (
            <p className="text-sm text-gray-700">
              Payment Status:{" "}
              <span
                className={`font-semibold ${
                  s.payment_status === "Completed"
                    ? "text-green-700"
                    : s.payment_status === "Pending"
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                {s.payment_status}
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => viewVehicleDetails(s.vehicleid)}
              className="text-blue-900 font-semibold hover:underline"
            >
              View Sale Details
            </button>

            {s.status === "Verification Pending" && (
              <button
                onClick={() => cancelSale(s.saleid)}
                disabled={actionLoading}
                className="flex items-center gap-1 text-red-700 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" /> Cancel Sale
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>
    </div>
  );
};

export default MyBookingsPage;
