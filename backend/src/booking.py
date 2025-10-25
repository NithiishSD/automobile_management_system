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
        
@bookingbp.route('/api/bookings', methods=['GET'])
def get_vehicle_bookings():
    pid=request.args.get("user")
    if not pid:
        return jsonify({"message": "User ID not provided"}), 400
    cur = db.cursor()
    cur.execute("SELECT customerid FROM customer WHERE pid=%s", (pid,))
    customer=cur.fetchone()
    db.commit()
    if not customer:
        cur.close()
        return jsonify({"message": "Customer not found"}), 400
    
    customer_id = customer[0]
    cur.execute("SELECT o.*,v.model,v.vin,s.finalprice FROM orderbooking o join sales s join vehicle v on o.customerid=s.cust_id and s.vehicleid=v.vehicleid  WHERE customerid=%s ORDER BY booking DESC", (customer_id,))
    bookings = cur.fetchall()
    if not bookings:
        cur.close()
        return jsonify({"message": "No bookings found"}), 204
    
    headings = [ "id","status","customerid","created_at","expiry", "vehicle_name","vehicle_id","total_amount"]
    cur.close()
   
    return {'orders':convert_tojson(headings, bookings)}
