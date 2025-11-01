from flask import Blueprint,request,jsonify
from datetime import datetime
from flask_jwt_extended import  jwt_required, get_jwt_identity
from .utility import convert_tojson,generate_orderid
from src import db
import arrow
bookingbp=Blueprint("booking","__name__")


@bookingbp.route("/api/bookings",methods=["POST"])
@jwt_required()
def book_a_vehicle():
    cur=db.cursor()
    if request.method=='POST':
        userid=get_jwt_identity()
        vehicledetail=request.get_json()
        vehicleid=vehicledetail.get("vehicle_id")
        cur.execute("select customerid from customer where pid in(select pid from people where userid=%s) ",(userid,))
        custid=cur.fetchone()
        custid=custid[0]
        cur.execute("commit")
        
        if custid:
            cur.execute("select customerid,count(*) from orderbooking group by customerid having customerid=%s",(custid,))
            cnt=cur.fetchone()
            if cnt:
                cnt=cnt[1]
                print("ordno-------------------------",cnt)
            else:
                cnt=0
            ordid=generate_orderid(custid,cnt)
            try:
                cur.execute("insert into orderbooking values(%s,%s,%s,%s,%s,%s)",(ordid,'pending',custid,datetime.now(), arrow.now().shift(months=3).naive,vehicleid))
                cur.execute("commit")
                return jsonify({'customerid':custid,'message':"succesfully ordered"}),201
            except Exception as e :
                print("Error inserting order:", str(e))  # ✅ print the actual cause
                return jsonify({'customerid':custid,'message':"unsuccessfull there is some problem in the server"}),400
            finally:
                cur.close()
        else:
           
            return jsonify({'message':"the customerid not found"}),400
        
@bookingbp.route('/api/bookings', methods=['GET',"OPTIONS"])
def get_vehicle_bookings():
    cur=db.cursor()
    username=request.args.get("user")
    if not username:
        return jsonify({"message": "User ID not provided"}), 400
    cur = db.cursor(dictionary=True)
    cur.execute("select pid from people where userid in(select id from users where username=%s)",(username,))
    userid=cur.fetchone()
    pid=userid.get("pid")
    db.commit()
    cur.close()
    cur=db.cursor(dictionary=True)
    
    cur.execute("SELECT customerid FROM customer WHERE pid=%s", (pid,))
    customer=cur.fetchone()
    db.commit()
    if not customer:
        cur.close()
        return jsonify({"message": "Customer not found"}), 400
    
    print("the custsjbfsfisgdfvshfgsif>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.",customer)
    customer_id = customer.get("customer_id")

    cur.execute("SELECT o.*,v.model,v.vin,s.finalprice FROM orderbooking o join sales s join vehicle v on o.customerid=s.cust_id and s.vehicleid=v.vehicleid  WHERE customerid=%s ORDER BY booking DESC", (customer_id,))
    bookings = cur.fetchall()
    if not bookings:
        cur.close()
        print("no rrecords found")
        return jsonify({"orders": []}), 200
    
    headings = [ "id","status","customerid","created_at","expiry", "vehicle_name","vehicle_id","total_amount"]
    cur.close()
   
    return {'orders':jsonify(convert_tojson(headings, bookings))}
