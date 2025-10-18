from flask import Blueprint,flask,request,jsonify
from src import db
from .utility import convert_tojson

servicebookingbp=Blueprint('servicebookingbp',"__name__")

@servicebookingbp.route('/api/servicebookings', methods=['POST'])
def create_service_booking():
    cur=db.cursor()
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


@servicebookingbp.route('/api/servicebookings', methods=['GET'])
def get_service_bookings():
    cur = db.cursor()
    cur.execute("""
        SELECT sb.sid, c.name AS customer, v.model AS vehicle, st.name AS service_type,st.description as service_done, sb.appointment_date, sb.status,nvl(sr.completiondate,"service going on") 
        FROM ServiceBooking sb
        JOIN Customer c ON sb.customer_id = c.customer_id
        JOIN Vehicle v ON sb.vehicle_id = v.vehicle_id
        JOIN ServiceType st ON sb.sid = st.service_id
        JOIN servicerecord sr on sb.sid=SR.servicebookid 
        order by sb.appointment_date DESC""")
    rows = cur.fetchall()
    cur.close()
    columns=["servicebookid","customer_name","model","servicetype","service_description","service_date","status"]
    bookings=convert_tojson(rows,columns)
   

    return jsonify(bookings)
