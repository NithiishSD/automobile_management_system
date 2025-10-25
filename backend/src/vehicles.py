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

@vehiclebp.route("/api/sell", methods=["POST"])
@jwt_required()
def sell_vehicle():
    """Endpoint for users to submit their vehicle for sale"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields based on your frontend form
        required_fields = ['brand', 'model', 'year', 'condition', 'mileage', 'expected_price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Generate unique IDs
        vehicle_id = f"V{str(uuid.uuid4())[:8].upper()}"
        inventory_id = f"INV{str(uuid.uuid4())[:8].upper()}"
        
        cur = connection.cursor()
        
        # Start transaction
        connection.start_transaction()
        
        # 1. Insert into vehicle table (according to your database.sql)
        vehicle_query = """
            INSERT INTO vehicle (VehicleId, Vin, Model, Cost, BasePrice, VehicleImageURL)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        vin = f"{data['brand'][:3]}{data['model'][:3]}{data['year']}{str(uuid.uuid4())[:6].upper()}"
        # Calculate cost as 80% of expected price for resale
        expected_price = float(data['expected_price'])
        cost = expected_price * 0.8  # Business logic: cost is 80% of selling price
        
        vehicle_data = (
            vehicle_id,
            vin,
            f"{data['brand']} {data['model']}",
            cost,
            expected_price,
            ""  # No image URL for user-submitted vehicles initially
        )
        cur.execute(vehicle_query, vehicle_data)
        
        # 2. Check if it's new or used and insert accordingly
        if data['condition'].lower() == 'new':
            # Insert into newvehicle table
            new_vehicle_query = """
                INSERT INTO newvehicle (VehicleId, YearOfMake, WarrantyPeriod)
                VALUES (%s, %s, %s)
            """
            new_vehicle_data = (
                vehicle_id,
                int(data['year']),
                1  # Default 1 year warranty for new vehicles
            )
            cur.execute(new_vehicle_query, new_vehicle_data)
            
            # Insert into colorchoice (default color)
            color_query = """
                INSERT INTO colorchoice (VehicleId, ColorName)
                VALUES (%s, %s)
            """
            color_data = (vehicle_id, "Unknown")  # Default color
            cur.execute(color_query, color_data)
            
        else:  # Used vehicle
            # Insert into resalevehicle table
            resale_query = """
                INSERT INTO resalevehicle (VehicleId, OwnerId, VehicleCondition)
                VALUES (%s, %s, %s)
            """
            # For now, use a default owner ID. In production, you'd link to actual user
            owner_id = 301  # Default owner ID from your sample data
            resale_data = (
                vehicle_id,
                owner_id,
                "Good"  # Default condition for used vehicles
            )
            cur.execute(resale_query, resale_data)
            
            # Insert into vehiclehistory for used vehicles
            history_id = f"H{str(uuid.uuid4())[:8].upper()}"
            history_query = """
                INSERT INTO vehiclehistory (HistoryId, VehicleId, RecordDate, OilCondition, VehicleCondition, RunKilometers, ServiceRemarks, AccidentHistory, NumOfOwners)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            history_data = (
                history_id,
                vehicle_id,
                datetime.now().date(),
                "Good",  # Default oil condition
                "Good",  # Default vehicle condition
                int(data['mileage']),
                data.get('description', 'No remarks'),  # Use description if provided
                "None",  # Default no accident history
                1  # First owner
            )
            cur.execute(history_query, history_data)
        
        # 3. Insert into performance table
        performance_query = """
            INSERT INTO performance (VehicleId, Transmission, Drivetrain, Cylinders, FuelType, Mileage)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        # Use default values for technical specs that user might not provide
        performance_data = (
            vehicle_id,
            "Manual",  # Default transmission
            "FWD",     # Default drivetrain
            4,         # Default cylinders
            "Petrol",  # Default fuel type
            float(data['mileage'])  # Use the mileage from form
        )
        cur.execute(performance_query, performance_data)
        
        # 4. Insert into inventory table
        inventory_query = """
            INSERT INTO inventory (InventoryId, VehicleId, StockStatus, Quantity, Location)
            VALUES (%s, %s, %s, %s, %s)
        """
        inventory_data = (
            inventory_id,
            vehicle_id,
            "Pending Review",  # Status for user-submitted vehicles
            1,
            "Pending Inspection"  # Location until reviewed
        )
        cur.execute(inventory_query, inventory_data)
        
        # Commit transaction
        connection.commit()
        cur.close()
        
        return jsonify({
            "message": "Vehicle submitted successfully for review! Our team will contact you soon.",
            "vehicle_id": vehicle_id,
            "status": "Pending Review"
        }), 201
        
    except Exception as e:
        # Rollback in case of error
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
    """Get vehicles submitted by the current user for sale"""
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        current_user = get_jwt_identity()
        
        cur = connection.cursor()
        query = """
            SELECT v.VehicleId, v.Model, v.BasePrice, i.StockStatus, vh.RecordDate, vh.VehicleCondition
            FROM vehicle v
            JOIN inventory i ON v.VehicleId = i.VehicleId
            JOIN vehiclehistory vh ON v.VehicleId = vh.VehicleId
            WHERE i.StockStatus = 'Pending Review'
            ORDER BY vh.RecordDate DESC
        """
        
        cur.execute(query)
        records = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()
        
        vehicles = [dict(zip(columns, row)) for row in records]
        return jsonify({"vehicles": vehicles}), 200
        
    except Exception as e:
        print(f"Error in get_my_vehicles: {str(e)}")
        return jsonify({"error": str(e)}), 500