from flask import Blueprint, request, jsonify
from src import db

viewbookingbp = Blueprint("viewbooking", __name__)
@viewbookingbp.route("/api/view-bookings", methods=["GET"])
def view_user_bookings():
    try:
        customer_id = request.args.get("customerid", type=int)
        if not customer_id:
            return jsonify({"error": "customerid is required"}), 400
        cur = db.cursor()
        query = """
        SELECT o.bookid AS bookingid,o.status,o.booking,o.expirydate,v.VehicleId,v.Model AS vehiclename,v.Cost,v.BasePrice
        FROM orderbooking o
        JOIN vehicle v ON o.vehicleid = v.VehicleId
        WHERE o.customerid = %s
        ORDER BY o.booking DESC
        """
        cur.execute(query, (customer_id,))
        records = cur.fetchall()
        if not records:
            return jsonify({"message": "No bookings found for this customer."}), 404
        column_names = [desc[0] for desc in cur.description]
        bookings = [dict(zip(column_names, row)) for row in records]
        cur.close()
        return jsonify(bookings), 200

    except Exception as e:
        print("Error fetching bookings:", e)
        return jsonify({"error": "Internal server error"}), 500
