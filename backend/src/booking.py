from flask import Blueprint,request,jsonify
from datetime import datetime
from flask_jwt_extended import  jwt_required, get_jwt_identity
from .utility import convert_tojson,generate_orderid
from src import db
import arrow
bookingbp=Blueprint("booking","__name__")
cur=db.cursor()

@bookingbp.route("/api/bookings",methods=["post"])
@jwt_required()
def book_a_vehicle():
    if request.method=='post':
        userid=get_jwt_identity()

        custid= cur.execute("select customerid from customer where pid in(select pid from people where userid=%s) ",userid).fetchone()
        cur.execute("commit")
        cur.close()
        if custid:
            cnt=cur.execute("select custid,count(*) from orderbooking group by custid having custid=%s",custid).fetchone()[1] 
            ordid=generate_orderid(custid,cnt)
            try:
                cur.execute("insert into orderbooking values(%s,%s,%s,%s,%s,%s)",(ordid,'pending',custid,datetime.now(), arrow.now().shift(months=3),custid,))
                cur.execute("commit")
                return jsonify({'customerid':custid,'message':"succesfully ordered"}),201
            except Exception :
               return jsonify({'customerid':custid,'message':"unsuccessfull there is some problem in the server"}),400
        else:
            return jsonify({'message':"the customerid not found"}),400
    
@bookingbp.route('/bookings/vehicle/<int:customer_id>', methods=['GET'])
def get_vehicle_bookings(customer_id):
    cur = db.cursor()
    cur.execute("""
        SELECT * FROM service_booking
        WHERE customer_id = %s
        ORDER BY booking_date DESC
    """, (customer_id,))
    bookings = cur.fetchall()
    cur.close()
    if bookings:
        headings=[desc[0] for desc in cur.description]
        return convert_tojson(headings,bookings)
    else:
        return jsonify({"messsage":"the given customer has no history of records"}),400


