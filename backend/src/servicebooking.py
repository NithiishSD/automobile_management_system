from flask import Blueprint,flask,request,jsonify
from src import db

servicebookingbp=Blueprint('servicebookingbp',"__name__")
cur=db.cursor()
@servicebookingbp.route('/api/servicebookings', methods=['POST'])
def create_service_booking():
    record= request.get_json()

    customer_id = record.get('customer_id')
    vehicle_id = record.get('vehicle_id')
    service_type_id = record.get('service_type_id')
    service_date = record.get('service_date')
    status = record.get('status', 'Pending')  # Default status

    if not all([customer_id, vehicle_id, service_type_id, service_date]):
        return jsonify({"error": "Missing required fields"}), 400

    

    sql = """
        INSERT INTO ServiceBooking (appointment_date,status,service_id,customer_id,vehicle_id)
        VALUES (%s, %s, %s, %s, %s)
    """
    cur.execute(sql, (service_date, status, service_type_id,customer_id,vehicle_id))
    cur.commit()
    cur.close()

    return jsonify({"message": "Service booking created successfully"}), 201
