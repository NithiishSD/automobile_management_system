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
    db.commit()
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

@servicebookingbp.route('/servicebookings/<int:service_id>', methods=['GET'])
def get_service_booking(service_id):
    cur = db.cursor()
    sql="""
        SELECT sb.sid, c.name AS customer, v.model AS vehicle, st.name AS service_type,st.description as service_done, sb.appointment_date, sb.status,nvl(sr.completiondate,"service going on") 
        FROM ServiceBooking sb
        JOIN Customer c ON sb.customer_id = c.customer_id
        JOIN Vehicle v ON sb.vehicle_id = v.vehicle_id
        JOIN ServiceType st ON sb.sid = st.service_id
        JOIN servicerecord sr on sb.sid=SR.servicebookid 
        where sb.sid=%s"""
    cur.execute(sql,service_id)
    row = cur.fetchone()
    db.commit()
    cur.close()

    if not row:
        return jsonify({"error": "Booking not found"}), 404
    columns=["servicebookid","customer_name","model","servicetype","service_description","service_date","status"]
    bookings=convert_tojson(row,columns)
   
    
    return jsonify(bookings)


@servicebookingbp.route('/servicebookings/<int:service_id>', methods=['PUT'])
def update_service_booking(service_id):
    data = request.get_json()
    status = data.get('status')
    service_record_id=data.get("service_record_id")
    service_book=data.get("service_book_id")
    service_cost=data.get("service_cost")
    completion_date=data.get("completion_date")

    if not all([ status,service_record_id,service_book,service_cost, completion_date]):
        return jsonify({"error": "missing  field "}), 400

    cur = db.cursor()
    cur.execute("update ServiceBooking SET status = %s WHERE booking_id = %s", (status,service_id))

    db.commit()
    cur.execute("insert into servicerecord values(%s,%s,%s,%s,%s)",(service_record_id,service_book,status,service_cost,completion_date))
    db.commit()
    cur.close()

    return jsonify({"message": "Service booking updated successfully"}),200


