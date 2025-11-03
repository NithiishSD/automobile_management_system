from flask import Blueprint,request,jsonify
from datetime import datetime
from flask_jwt_extended import  jwt_required, get_jwt_identity
from .utility import convert_tojson,generate_orderid
from src import db
import arrow
bookingbp=Blueprint("booking","__name__")


@bookingbp.route("/api/bookings",methods=["POST","OPTIONS"])
@jwt_required()
def book_a_vehicle():
    if request.method == 'OPTIONS':
        return '', 200
    cur=db.cursor()
    if request.method:
        print("entered the put method")
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
                print("Error inserting order:", str(e))  # print the actual cause
                return jsonify({'customerid':custid,'message':"unsuccessfull there is some problem in the server"}),400
            finally:
                cur.close()
        else:
           
            return jsonify({'message':"the customerid not found"}),400
        
@bookingbp.route('/api/orders', methods=['GET',"OPTIONS"])
def get_vehicle_orders():
    if request.method == 'OPTIONS':
        return '', 200
    cur=db.cursor()
    username=request.args.get("user")
    if not username:
        return jsonify({"message": "User ID not provided"}), 400
    cur = db.cursor(dictionary=True)
    cur.execute("select pid from people where userid in(select id from users where username=%s)",(username,))
    userid=cur.fetchone()
    if not userid:
        return jsonify({"message": "User ID not provided"}), 400
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
    
    
    customer_id = customer.get("customerid")
    cur.close()

    cur=db.cursor()
    cur.execute("SELECT o.*, v.model, v.vin, s.finalprice FROM orderbooking o  JOIN sales s ON o.bookid = s.order_id LEFT JOIN vehicle v ON o.vehicleid = v.vehicleid WHERE o.customerid = %s ORDER BY o.booking DESC;", (customer_id,))

    bookings = cur.fetchall()
    if not bookings:
        cur.close()
        print("no rrecords found")
        return jsonify({"orders": []}), 400
    
    headings = [ "id","status","customerid","created_at","expiry", "vehicle_name","vehicle_id","total_amount"]
    cur.close()
   
    return jsonify({"orders": convert_tojson(bookings,headings)})


@bookingbp.route('/api/bookings', methods=['GET',"OPTIONS"])
def get_vehicle_bookings():
    if request.method == 'OPTIONS':
        return '', 200
    cur=db.cursor()
    username=request.args.get("user")
    if not username:
        return jsonify({"message": "User ID not provided"}), 400
    cur = db.cursor(dictionary=True)
    cur.execute("select pid from people where userid in(select id from users where username=%s)",(username,))
    userid=cur.fetchone()
    if not userid:
        return jsonify({"message": "User ID not provided"}), 400
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
    
    
    customer_id = customer.get("customerid")
    print(customer_id)
    cur.close()

    cur=db.cursor()

    cur.execute("""SELECT b.bookid,b.booking, p.status,p.paymentmode, v.cost,  v.vehicleId,  v.brand,v.model,c.colorName, v.vin, b.expirydate 
                FROM orderbooking b LEFT JOIN vehicle v ON b.vehicleid = v.vehicleid left join colorchoice c on v.vehicleid=c.vehicleid left join payment p on b.bookid = p.bookid
                    WHERE b.customerid =%s""", (customer_id,))
    
    
    bookings = cur.fetchall()
    print(bookings)

    if not bookings:
        cur.close()
        print("no rrecords found")
        return jsonify({"bookings": []}), 200
    
    headings = [ "bookid","booking_date","status","payment_mode","total_amount","vehicle_id","brand","model","color","vin","delivery_date"]
    cur.close()
   
    return jsonify({"bookings":convert_tojson(bookings, headings)})

@bookingbp.route('/api/sales', methods=['GET',"OPTIONS"])
@jwt_required()
def get_sales_booking():
    if request.method =='OPTIONS':
            return '',200
    
    try:
        
        userid=get_jwt_identity()
        cur= db.cursor(dictionary=True)
        if not userid:
            return jsonify({'msg': 'Unauthorized access'}), 401
        cur.execute("select ownerid from resaleowner where pid in(select pid from people where userid=%s) ",(userid,))
        ownerid=cur.fetchone()
        if not ownerid:
            return jsonify({"message": "User ID not provided"}), 400
        db.commit()
        
        ownerid=ownerid.get("ownerid")
        print("-------------------------------",userid)
        query = """
        SELECT 
            rs.resalebkid AS saleid,
            rv.VehicleId AS vehicleid,
            v.Brand AS brand,
            v.Model AS model,
            cc.colorname AS color,
            rv.Conditions AS vehicle_condition,
            rs.expected_amount AS expected_price,
            v.cost AS base_price,
            rv.verification AS status,
            rs.booking_date AS date_listed,
            v.VehicleImageURL AS image,
            COALESCE(p.status, 'Pending') AS payment_status,
            p.paymentmode AS payment_mode,
            p.paymentdate AS payment_date
        FROM resalevehicle rv right join vehicle v on rv.vehicleId=v.vehicleId left join colorchoice cc on cc.vehicleid=rv.vehicleid  left join resale_booking rs  on rs.vehicleid=rv.VehicleId
        LEFT JOIN payment p ON rs.resalebkid = p.resalebookid
        WHERE rv.ownerid = %s
        ORDER BY rs.booking_date DESC
        """
        
        cur.execute(query, (ownerid,))
        sales = cur.fetchall()

        cur.close()
        

        return jsonify({'sales': sales}), 200

    except Exception as e:
        print("Error fetching sales:", e)
        return jsonify({'msg': 'Internal Server Error', 'error': str(e)}), 500

