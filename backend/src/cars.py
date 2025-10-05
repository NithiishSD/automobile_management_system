from flask import Blueprint,request,jsonify
from src import db
from .utility import convert_tojson
cur=db.cursor()

carsbp=Blueprint("cars","__name__")

@carsbp.route("/api/cars-new")
def get_cars():
    location=request.args.get("location")
    cur.execute("select * from vehicles where location=%s ",location)
    details=cur.fetchall()
    cur.execute("commit")
    if details:
        return convert_tojson(details,cur),200
    else:
        return jsonify({'message':"there is no cars in the given location"}),401
    

