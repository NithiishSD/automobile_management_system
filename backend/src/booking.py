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
        if custid:
            cnt=cur.execute("select custid,count(*) from orderbooking group by custid having custid=%s",custid).fetchone()[1] 
            ordid=generate_orderid(custid,cnt)
            try:
                cur.execute("insert into orderbooking values(%s,%s,%s,%s,%s)",(ordid,'pending',custid,datetime.now(),arrow.now().shift(months+=3)))
                cur.execute("commit")
                return jsonify({'customerid':custid,'message':"succesfully ordered"}),201
            except Exception :
               return jsonify({'customerid':custid,'message':"unsuccessfull there is some problem int the server"}),400
        else:
            return jsonify({'message':"the customerid not found"}),400
    
