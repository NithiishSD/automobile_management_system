from flask import Blueprint, request, jsonify
from src import db, create_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime

vehiclebp = Blueprint("vehicles", __name__)

def get_db_connection():
    """Get database connection, reconnect if needed"""
    try:
        if db is None or not db.is_connected():
            print("Database connection lost, reconnecting...")
            return create_db_connection()
        return db
    except:
        print("Database connection error, reconnecting...")
        return create_db_connection()

@vehiclebp.route("/api/vehicles", methods=["GET"])
def get_vehicles():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        vtype = request.args.get("type")
        status = request.args.get("status")
        model = request.args.get("model")
        min_price = request.args.get("min_price")
        max_price = request.args.get("max_price")
        fuel_type = request.args.get("fuel_type")
        transmission = request.args.get("transmission")
        color = request.args.get("color")
        year = request.args.get("year")
        sort_by = request.args.get("sort_by", "v.Model")

        cur = connection.cursor()
        query = """SELECT 
                v.VehicleId, v.Vin, v.Model, v.Cost, v.BasePrice, v.VehicleImageURL,
                p.FuelType, p.Transmission, c.ColorName AS Color, 
                nv.YearOfMake AS Year, i.StockStatus,
                CASE
                    WHEN nv.VehicleId IS NOT NULL THEN 'new'
                    WHEN rv.VehicleId IS NOT NULL THEN 'used'
                    ELSE 'unknown'
                END as Type
            FROM vehicle v
            LEFT JOIN newvehicle nv ON v.VehicleId = nv.VehicleId
            LEFT JOIN resalevehicle rv ON v.VehicleId = rv.VehicleId
            LEFT JOIN inventory i ON v.VehicleId = i.VehicleId
            LEFT JOIN performance p ON v.VehicleId = p.VehicleId
            LEFT JOIN colorchoice c ON v.VehicleId = c.VehicleId
            WHERE 1=1
        """

        params = []
        if vtype:
            query += " AND (CASE WHEN nv.VehicleId IS NOT NULL THEN 'new' WHEN rv.VehicleId IS NOT NULL THEN 'used' ELSE 'unknown' END) = %s"
            params.append(vtype.lower())
        if model:
            query += " AND v.Model LIKE %s"
            params.append(f"%{model}%")
        if status:
            query += " AND i.StockStatus = %s"
            params.append(status)
        if fuel_type:
            query += " AND p.FuelType = %s"
            params.append(fuel_type)
        if transmission:
            query += " AND p.Transmission = %s"
            params.append(transmission)
        if color:
            query += " AND c.ColorName = %s"
            params.append(color)
        if year:
            query += " AND nv.YearOfMake = %s"
            params.append(year)
        if min_price:
            query += " AND v.BasePrice >= %s"
            params.append(min_price)
        if max_price:
            query += " AND v.BasePrice <= %s"
            params.append(max_price)

        allowed_sort = {
            "price": "v.BasePrice",
            "model": "v.Model", 
            "year": "nv.YearOfMake"
        }
        sort_column = allowed_sort.get(sort_by.lower(), "v.Model")
        query += f" ORDER BY {sort_column}"

        print(f"Executing query: {query}")
        print(f"With params: {params}")
        
        cur.execute(query, tuple(params))
        records = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()

        if not records:
            return jsonify({"message": "No vehicles found matching filters"}), 200

        vehicles = [dict(zip(columns, row)) for row in records]
        return jsonify({"count": len(vehicles), "vehicles": vehicles}), 200

    except Exception as e:
        print(f"Error in get_vehicles: {str(e)}")
        return jsonify({"error": str(e)}), 500

@vehiclebp.route("/api/vehicles/<vehicle_id>", methods=["GET"])
def get_vehicle_by_id(vehicle_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        print(f"Fetching vehicle with ID: {vehicle_id}")
        
        cur = connection.cursor()
        
        query = """SELECT 
                v.VehicleId, v.Vin, v.Model, v.Cost, v.BasePrice, v.VehicleImageURL,
                p.FuelType, p.Transmission,
                c.ColorName AS Color, 
                nv.YearOfMake AS Year,
                i.StockStatus,
                CASE
                    WHEN nv.VehicleId IS NOT NULL THEN 'new'
                    WHEN rv.VehicleId IS NOT NULL THEN 'used'
                    ELSE 'unknown'
                END as Type
            FROM vehicle v
            LEFT JOIN newvehicle nv ON v.VehicleId = nv.VehicleId
            LEFT JOIN resalevehicle rv ON v.VehicleId = rv.VehicleId
            LEFT JOIN inventory i ON v.VehicleId = i.VehicleId
            LEFT JOIN performance p ON v.VehicleId = p.VehicleId
            LEFT JOIN colorchoice c ON v.VehicleId = c.VehicleId
            WHERE v.VehicleId = %s
        """
        
        cur.execute(query, (vehicle_id,))
        record = cur.fetchone()
        
        print(f"Database result: {record}")

        if not record:
            cur.close()
            return jsonify({"message": f"Vehicle with ID {vehicle_id} not found"}), 404

        columns = [desc[0] for desc in cur.description]
        cur.close()

        vehicle = dict(zip(columns, record))
        print(f"Mapped vehicle: {vehicle}")
        return jsonify(vehicle), 200

    except Exception as e:
        print(f"Error in get_vehicle_by_id: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@vehiclebp.route("/api/vehicle-options", methods=["GET"])
def get_vehicle_options():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        cur = connection.cursor()
        
        # Get fuel types
        cur.execute("SELECT DISTINCT FuelType FROM performance WHERE FuelType IS NOT NULL")
        fuel_types = [row[0] for row in cur.fetchall()]
        
        # Get colors
        cur.execute("SELECT DISTINCT ColorName FROM colorchoice WHERE ColorName IS NOT NULL")
        colors = [row[0] for row in cur.fetchall()]
        
        # Get transmissions
        cur.execute("SELECT DISTINCT Transmission FROM performance WHERE Transmission IS NOT NULL")
        transmissions = [row[0] for row in cur.fetchall()]
        
        # Get years
        cur.execute("SELECT DISTINCT YearOfMake FROM newvehicle WHERE YearOfMake IS NOT NULL ORDER BY YearOfMake DESC")
        years = [str(row[0]) for row in cur.fetchall()]
        
        # Get statuses (from inventory)
        cur.execute("SELECT DISTINCT StockStatus FROM inventory WHERE StockStatus IS NOT NULL")
        statuses = [row[0] for row in cur.fetchall()]
        
        cur.close()
        
        return jsonify({
            "fuelTypes": fuel_types,
            "colors": colors,
            "transmissions": transmissions,
            "years": years,
            "statuses": statuses
        }), 200
        
    except Exception as e:
        print(f"Error in get_vehicle_options: {str(e)}")
        return jsonify({"error": str(e)}), 500

@vehiclebp.route("/api/debug/user", methods=["GET"])
@jwt_required()
def debug_user():
    """Debug endpoint to check user information"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        current_user_id = get_jwt_identity()
        cur = connection.cursor()
        
        # Check if user exists
        cur.execute("SELECT id, username, email, role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        
        # Check if person exists for this user
        cur.execute("SELECT pid, firstname, lastname FROM people WHERE userid = %s", (current_user_id,))
        person = cur.fetchone()
        
        cur.close()
        
        return jsonify({
            "jwt_user_id": current_user_id,
            "user_exists": bool(user),
            "user_data": dict(zip(['id', 'username', 'email', 'role'], user)) if user else None,
            "person_exists": bool(person),
            "person_data": dict(zip(['pid', 'firstname', 'lastname'], person)) if person else None
        }), 200
        
    except Exception as e:
        print(f"Debug error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@vehiclebp.route("/api/sell", methods=["POST"])
def sell_vehicle():
    """Sell vehicle endpoint - No JWT required"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        data = request.get_json()
        
        print(f"Received sell request: {data}")
        
        # Validate required fields
        required_fields = ['brand', 'model', 'year', 'condition', 'mileage', 'expected_price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        cur = connection.cursor()
        
        # Generate unique IDs
        vehicle_id = f"V{str(uuid.uuid4())[:8].upper()}"
        inventory_id = f"INV{str(uuid.uuid4())[:8].upper()}"
        
        # Start transaction
        connection.start_transaction()
        
        # Create a generic seller record
        person_id = f"P{str(uuid.uuid4())[:8].upper()}"
        person_query = """
            INSERT INTO people (pid, firstname, lastname, email)
            VALUES (%s, %s, %s, %s)
        """
        seller_name = data.get('seller_name', 'Vehicle Seller')
        seller_email = data.get('seller_email', 'contact@example.com')
        cur.execute(person_query, (person_id, seller_name, "Seller", seller_email))
        
        # Create resaleowner record
        owner_query = "INSERT INTO resaleowner (pid) VALUES (%s)"
        cur.execute(owner_query, (person_id,))
        cur.execute("SELECT ownerid FROM resaleowner WHERE pid = %s", (person_id,))
        owner = cur.fetchone()
        owner_id = owner[0]
        
        # Create customer record
        customer_id = f"C{str(uuid.uuid4())[:8].upper()}"
        customer_query = """
            INSERT INTO customer (customerid, pid, customertype)
            VALUES (%s, %s, %s)
        """
        cur.execute(customer_query, (customer_id, person_id, "regular"))
        
        # Insert into vehicle table - FIX VIN GENERATION
        vehicle_query = """
            INSERT INTO vehicle (VehicleId, Vin, Model, Cost, BasePrice, VehicleImageURL)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        # Generate proper 17-character VIN
        brand_code = data['brand'][:3].upper().ljust(3, 'X')
        model_code = data['model'][:3].upper().ljust(3, 'X')
        year_code = str(data['year'])[-2:]  # Last 2 digits of year
        unique_id = str(uuid.uuid4())[:8].upper()
        
        # Combine to make exactly 17 characters
        vin = f"{brand_code}{model_code}{year_code}{unique_id}"
        vin = vin.ljust(17, '0')[:17]  # Ensure exactly 17 characters
        
        print(f"Generated VIN: {vin} (Length: {len(vin)})")
        
        expected_price = float(data['expected_price'])
        cost = expected_price * 0.8
        
        vehicle_data = (
            vehicle_id,
            vin,
            f"{data['brand']} {data['model']}",
            cost,
            expected_price,
            data.get('image_url', '')
        )
        cur.execute(vehicle_query, vehicle_data)
        
        # Insert into resalevehicle table
        resale_query = """
            INSERT INTO resalevehicle (VehicleId, OwnerId, VehicleCondition)
            VALUES (%s, %s, %s)
        """
        resale_data = (
            vehicle_id,
            owner_id,
            data['condition'].capitalize()
        )
        cur.execute(resale_query, resale_data)
        
        # Insert into performance table
        performance_query = """
            INSERT INTO performance (VehicleId, Transmission, FuelType, Mileage)
            VALUES (%s, %s, %s, %s)
        """
        performance_data = (
            vehicle_id,
            data.get('transmission', 'Manual'),
            data.get('fuel_type', 'Petrol'),
            float(data['mileage'])
        )
        cur.execute(performance_query, performance_data)
        
        # Insert into inventory table
        inventory_query = """
            INSERT INTO inventory (InventoryId, VehicleId, StockStatus, Quantity, Location)
            VALUES (%s, %s, %s, %s, %s)
        """
        inventory_data = (
            inventory_id,
            vehicle_id,
            "Pending Review",
            1,
            "Pending Inspection"
        )
        cur.execute(inventory_query, inventory_data)
        
        # Create vehicle history record
        history_id = f"H{str(uuid.uuid4())[:8].upper()}"
        history_query = """
            INSERT INTO vehiclehistory (HistoryId, VehicleId, RecordDate, VehicleCondition, RunKilometers, ServiceRemarks, AccidentHistory, NumOfOwners)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        history_data = (
            history_id,
            vehicle_id,
            datetime.now().date(),
            data['condition'].capitalize(),
            int(data['mileage']),
            data.get('description', 'No remarks'),
            data.get('accident_history', 'None reported'),
            1
        )
        cur.execute(history_query, history_data)
        
        # Commit transaction
        connection.commit()
        cur.close()
        
        return jsonify({
            "message": "Vehicle submitted successfully for review!",
            "vehicle_id": vehicle_id,
            "status": "Pending Review"
        }), 201
        
    except Exception as e:
        connection.rollback()
        print(f"Error in sell_vehicle: {str(e)}")
        return jsonify({"error": f"Failed to submit vehicle: {str(e)}"}), 500

@vehiclebp.route("/api/pending-vehicles", methods=["GET"])
@jwt_required()
def get_pending_vehicles():
    """Get vehicles pending review (for admin)"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        cur = connection.cursor()
        query = """
            SELECT 
                v.VehicleId, v.Model, v.BasePrice, v.VehicleImageURL,
                i.StockStatus, i.Location,
                p.FuelType, p.Mileage,
                CASE 
                    WHEN nv.VehicleId IS NOT NULL THEN 'new'
                    WHEN rv.VehicleId IS NOT NULL THEN 'used'
                    ELSE 'unknown'
                END as Type,
                COALESCE(nv.YearOfMake, 'N/A') as Year
            FROM vehicle v
            JOIN inventory i ON v.VehicleId = i.VehicleId
            LEFT JOIN performance p ON v.VehicleId = p.VehicleId
            LEFT JOIN newvehicle nv ON v.VehicleId = nv.VehicleId
            LEFT JOIN resalevehicle rv ON v.VehicleId = rv.VehicleId
            WHERE i.StockStatus = 'Pending Review'
            ORDER BY v.VehicleId
        """
        
        cur.execute(query)
        records = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()
        
        vehicles = [dict(zip(columns, row)) for row in records]
        return jsonify({"pending_vehicles": vehicles}), 200
        
    except Exception as e:
        print(f"Error in get_pending_vehicles: {str(e)}")
        return jsonify({"error": str(e)}), 500

@vehiclebp.route("/api/vehicles/<vehicle_id>/status", methods=["PUT"])
@jwt_required()
def update_vehicle_status(vehicle_id):
    """Update vehicle status (approve or reject)"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['In Stock', 'Rejected']:
            return jsonify({"error": "Invalid status. Use 'In Stock' or 'Rejected'"}), 400
        
        cur = connection.cursor()
        
        if new_status == 'In Stock':
            # If approving, update location to a proper showroom
            update_query = """
                UPDATE inventory 
                SET StockStatus = %s, Location = 'Main Showroom' 
                WHERE VehicleId = %s
            """
        else:
            # If rejecting, just update status
            update_query = """
                UPDATE inventory 
                SET StockStatus = %s 
                WHERE VehicleId = %s
            """
        
        cur.execute(update_query, (new_status, vehicle_id))
        connection.commit()
        cur.close()
        
        return jsonify({
            "message": f"Vehicle status updated to {new_status}",
            "vehicle_id": vehicle_id,
            "status": new_status
        }), 200
        
    except Exception as e:
        connection.rollback()
        print(f"Error in update_vehicle_status: {str(e)}")
        return jsonify({"error": str(e)}), 500

@vehiclebp.route("/api/my-vehicles", methods=["GET"])
@jwt_required()
def get_my_vehicles():
    """Get vehicles submitted by the current user for sale - Fixed version"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        current_user_id = get_jwt_identity()
        
        cur = connection.cursor()
        
        # Get person ID for current user
        cur.execute("SELECT pid FROM people WHERE userid = %s", (current_user_id,))
        person = cur.fetchone()
        
        if not person:
            return jsonify({"vehicles": []}), 200
        
        person_id = person[0]
        
        # Get resaleowner ID for this person
        cur.execute("SELECT ownerid FROM resaleowner WHERE pid = %s", (person_id,))
        owner = cur.fetchone()
        
        if not owner:
            return jsonify({"vehicles": []}), 200
        
        owner_id = owner[0]
        
        query = """
            SELECT 
                v.VehicleId, 
                v.Model, 
                v.BasePrice, 
                i.StockStatus, 
                vh.RecordDate, 
                vh.VehicleCondition,
                rv.OwnerId
            FROM vehicle v
            JOIN resalevehicle rv ON v.VehicleId = rv.VehicleId
            JOIN inventory i ON v.VehicleId = i.VehicleId
            JOIN vehiclehistory vh ON v.VehicleId = vh.VehicleId
            WHERE rv.OwnerId = %s
            ORDER BY vh.RecordDate DESC
        """
        
        cur.execute(query, (owner_id,))
        records = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()
        
        vehicles = [dict(zip(columns, row)) for row in records]
        return jsonify({"vehicles": vehicles}), 200
        
    except Exception as e:
        print(f"Error in get_my_vehicles: {str(e)}")
        return jsonify({"error": str(e)}), 500