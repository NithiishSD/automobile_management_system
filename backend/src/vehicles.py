from flask import Blueprint, request, jsonify
from src import db, create_db_connection
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime

vehiclebp = Blueprint("vehicles", __name__,static_folder='static')

current_host="http://127.0.0.1:5000"

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
        print("➡️ API hit: /api/vehicles")

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

        
        
        query = """
                SELECT 
            v.VehicleId, v.Vin, v.Model, v.Cost, v.BasePrice, v.VehicleImageURL,
            p.FuelType, p.Transmission,
            c.ColorName AS Color, 
            nv.YearOfMake AS Year,
            i.StockStatus,
            CASE
                WHEN nv.VehicleId IS NOT NULL THEN 'new'
                WHEN rv.VehicleId IS NOT NULL THEN 'used'
                ELSE 'unknown'
            END AS Type
            FROM vehicle v
            LEFT JOIN newvehicle nv ON v.VehicleId = nv.VehicleId
                LEFT JOIN resalevehicle rv ON v.VehicleId = rv.VehicleId
        LEFT JOIN inventory i ON v.VehicleId = i.VehicleId
        LEFT JOIN performance p ON v.VehicleId = p.VehicleId
        LEFT JOIN colorchoice c ON v.VehicleId = c.VehicleId
        WHERE 1=1
        """

        params = []

        # ✅ Apply filters safely
        if vtype:
            if vtype.lower() == "new":
                query += " AND nv.VehicleId IS NOT NULL"
            elif vtype.lower() == "used":
                query += " AND rv.VehicleId IS NOT NULL"

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

        # ✅ Safe sorting
        allowed_sort = {
            "price": "v.BasePrice",
            "model": "v.Model", 
            "year": "nv.YearOfMake"
        }
        sort_column = allowed_sort.get((sort_by or "model").lower(), "v.Model")
        query += f" ORDER BY {sort_column}"

        print(f"Executing query: {query}")
        print(f"With params: {params}")
        
        cur = connection.cursor(dictionary=True)
        # cur.execute("SHOW PROCESSLIST")
       
        cur.execute(query, tuple(params))
        print("Query executed successfully")
        records = cur.fetchall()
        db.commit()
        print("Query executed successfully")
        if records:
            for record in records:
                    record["VehicleImageURL"]=f"{current_host}/{record.get("VehicleImageURL")}"
            
            cur.close()
            print("✅ API completed successfully")
        if not records:
            cur.close()
            return jsonify({"message": "No vehicles found matching filters"}), 200

        return jsonify({"count": len(records), "vehicles":records}), 200
            
    except Exception as e:
        print(f"Error in get_vehicles: {str(e)}")
        return jsonify({"error": str(e)}), 500

@vehiclebp.route("/api/vehicles/<vehicle_id>", methods=["GET"])
def get_vehicle_by_id(vehicle_id):
    connection = get_db_connection()
    print("exit out of connection functin")
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500
        
    try:
        print(f"Fetching vehicle with ID: {vehicle_id}")
        
        cur = connection.cursor(dictionary=True)
        print("enttered procedure")
        cur.callproc('GetVehicleById', (vehicle_id,))
        print("came out")
        for result in cur.stored_results():
            record = result.fetchone()
            record["VehicleImageURL"]=f"{current_host}/{record.get("VehicleImageURL")}"
        # print(f"Database result: {record}")

        if not record:
            cur.close()
            return jsonify({"message": f"Vehicle with ID {vehicle_id} not found"}), 404

        columns = [desc[0] for desc in cur.description]
        cur.close()

        vehicle = record
        # print(f"Mapped vehicle: {vehicle}")
        return jsonify(vehicle), 200

    except Exception as e:
        print(f"Error in get_vehicle_by_id: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500
    finally:
        if cur:
            cur.close()
        

@vehiclebp.route("/api/vehicle-options", methods=["GET"])
def get_vehicle_options():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection unavailable"}), 500

    try:
        cur = connection.cursor()

        cur = connection.cursor()
        
        # Get fuel types
        cur.execute("SELECT DISTINCT FuelType FROM performance WHERE FuelType IS NOT NULL")
        fuel_types = [row[0] for row in cur.fetchall()]
        db.commit()
        # Get colors
        cur.execute("SELECT DISTINCT ColorName FROM colorchoice WHERE ColorName IS NOT NULL")
        colors = [row[0] for row in cur.fetchall()]
        db.commit()
        
        # Get transmissions
        cur.execute("SELECT DISTINCT Transmission FROM performance WHERE Transmission IS NOT NULL")
        transmissions = [row[0] for row in cur.fetchall()]
        db.commit()
        # Get years
        cur.execute("SELECT DISTINCT YearOfMake FROM newvehicle WHERE YearOfMake IS NOT NULL ORDER BY YearOfMake DESC")
        years = [str(row[0]) for row in cur.fetchall()]
        db.commit()
        # Get statuses (from inventory)
        cur.execute("SELECT DISTINCT StockStatus FROM inventory WHERE StockStatus IS NOT NULL")
        statuses = [row[0] for row in cur.fetchall()]
        db.commit()
        print("options are done------------------------------")
        if cur: 
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
    print("entered the sell functin")
    """Sell vehicle endpoint - No JWT required at all"""
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
        
        # Handle person record - find existing or create new
        seller_email = data.get('seller_email', '')
        seller_name = data.get('seller_name', 'Anonymous Seller')
        person_id = None
        
        # Try to find existing person record by email
        if seller_email:
            cur.execute("SELECT pid FROM people WHERE email = %s", (seller_email,))
            existing_person = cur.fetchone()
            db.commit()
            if existing_person:
                # Reuse existing person record
                person_id = existing_person[0]
                print(f"Reusing existing person record: {person_id}")
            else:
                # Create new person record
                person_id = f"P{str(uuid.uuid4())[:8].upper()}"
                person_query = """
                    INSERT INTO people (pid, firstname, lastname, email)
                    VALUES (%s, %s, %s, %s)
                """
                cur.execute(person_query, (person_id, seller_name, "Seller", seller_email))
                db.commit()
                print(f"Created new person record: {person_id}")
        else:
            # No email provided, create new anonymous record
            person_id = f"P{str(uuid.uuid4())[:8].upper()}"
            person_query = """
                INSERT INTO people (pid, firstname, lastname, email)
                VALUES (%s, %s, %s, %s)
            """
            import time
            cur.execute(person_query, (person_id, seller_name, "Seller", f"anonymous_{int(time.time())}@example.com"))
            print(f"Created anonymous person record: {person_id}")
            db.commit()
        
        # Handle resaleowner - check if it exists for this person
        cur.execute("SELECT ownerid FROM resaleowner WHERE pid = %s", (person_id,))
        owner = cur.fetchone()
        db.commit()
        cur.execute("select count(*) from resaleowner")
        
        max_id = cur.fetchone()[0]
        db.commit()
        newid = 1 if max_id is None else max_id + 1
        cur=connection.cursor()
        if not owner:
            # Create resaleowner record

            owner_query = "INSERT INTO resaleowner (ownerid,pid) VALUES(%s,%s)"
            cur.execute(owner_query, (newid,person_id))
            cur.execute("SELECT ownerid FROM resaleowner WHERE pid = %s", (person_id,))
            owner = cur.fetchone()
            connection.commit()
            owner_id = owner[0]
            print(f"Created new resaleowner record: {owner_id}")
            
        else:
            owner_id = owner[0]
            print(f"Found existing resaleowner record: {owner_id}")
        
        # Handle customer record - check if it exists for this person
        cur.execute("SELECT customerid FROM customer WHERE pid = %s", (person_id,))
        customer = cur.fetchone()
        db.commit()
        if not customer:
            customer_id = f"C{str(uuid.uuid4())[:8].upper()}"
            customer_query = """
                INSERT INTO customer (customerid, pid, customertype)
                VALUES (%s, %s, %s)
            """
            cur.execute(customer_query, (customer_id, person_id, "regular"))
            print(f"Created new customer record: {customer_id}")
        else:
            customer_id = customer[0]
            print(f"Found existing customer record: {customer_id}")
        
        # Generate proper 17-character VIN
        brand_code = data['brand'][:3].upper().ljust(3, 'X')
        model_code = data['model'][:3].upper().ljust(3, 'X')
        year_code = str(data['year'])[-2:]
        unique_id = str(uuid.uuid4())[:8].upper()
        vin = f"{brand_code}{model_code}{year_code}{unique_id}"
        vin = vin.ljust(17, '0')[:17]
        
        expected_price = float(data['expected_price'])
        cost = expected_price * 0.8
        
        if connection is None:
            return jsonify({"error": "Database connection unavailable"}), 500 
        # Insert vehicle
        vehicle_query = """
            INSERT INTO vehicle (VehicleId, Vin, Model, Cost, BasePrice, VehicleImageURL)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        vehicle_data = (
            vehicle_id, 
            vin, 
            f"{data['brand']} {data['model']}", 
            cost, 
            expected_price, 
            data.get('image_url', '')
        )
        cur.execute(vehicle_query, vehicle_data)
        print(f"Created vehicle record: {vehicle_id}")
        db.commit()
        # Insert resalevehicle
        resale_query = """
            INSERT INTO resalevehicle (VehicleId, OwnerId, Conditions,verification)
            VALUES (%s, %s, %s,%s)
        """
        pending_query = """
                    INSERT INTO pending_vehicle_details
                        (VehicleId, Transmission, FuelType, Mileage, Location, RunKilometers, Description, AccidentHistory)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        pending_data = (
            vehicle_id,
            data.get('transmission', 'Manual'),
            data.get('fuel_type', 'Petrol'),
            float(data.get('mileage', 15.0)),
            'Pending Inspection',
            int(data.get('mileage', 50000)),
            data.get('description', 'No remarks'),
            data.get('accident_history', 'None reported')
        )
        cur.execute(pending_query, pending_data)
        db.commit()
        resale_data = (vehicle_id, owner_id, data['condition'].capitalize(),"Pending Inspection")
        cur.execute(resale_query, resale_data)
        db.commit()
        # Insert performance (using fuel efficiency)
        performance_query = """
            INSERT INTO performance (VehicleId, Transmission, FuelType, Mileage)
            VALUES (%s, %s, %s, %s)
        """
        # Make sure mileage is reasonable fuel efficiency (5-30 km/l)
        fuel_efficiency = float(data['mileage'])
        if fuel_efficiency > 50:  # If someone entered total km by mistake
            fuel_efficiency = 15.0  # Default reasonable fuel efficiency
        
        performance_data = (
            vehicle_id,
            data.get('transmission', 'Manual'),
            data.get('fuel_type', 'Petrol'),
            fuel_efficiency
        )
        cur.execute(performance_query, performance_data)
        db.commit()
        # Insert inventory
        inventory_query = """
            INSERT INTO inventory (InventoryId, VehicleId, StockStatus, Quantity, Location)
            VALUES (%s, %s, %s, %s, %s)
        """
        inventory_data = (inventory_id, vehicle_id, "Pending Review", 1, "Pending Inspection")
        cur.execute(inventory_query, inventory_data)
        db.commit()
        # Insert vehicle history (using reasonable run kilometers)
        history_id = f"H{str(uuid.uuid4())[:8].upper()}"
        history_query = """
            INSERT INTO vehiclehistory (HistoryId, VehicleId, RecordDate, VehicleCondition, RunKilometers, ServiceRemarks, AccidentHistory, NumOfOwners)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        # For history, use a reasonable total kilometers value
        total_kilometers = 50000  # Default reasonable value
        if float(data['mileage']) <= 500000:  # If reasonable total km was provided
            total_kilometers = int(data['mileage'])

        history_data = (
            history_id,
            vehicle_id,
            datetime.now().date(),
            data['condition'].capitalize(),
            total_kilometers,
            data.get('description', 'No remarks'),
            data.get('accident_history', 'None reported'),
            1
        )
        cur.execute(history_query, history_data)
        db.commit()
        # Commit transaction
        connection.commit()
        cur.close()
        
        return jsonify({
            "message": "Vehicle submitted successfully for review! Our team will contact you soon.",
            "vehicle_id": vehicle_id,
            "status": "Pending Review"
        }), 201
        
    except Exception as e:
        connection.rollback()
        print(f"Error in sell_vehicle: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
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
        db.commit()
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
