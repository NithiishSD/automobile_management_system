from flask import Blueprint,request,jsonify
from src import db
from .utility import convert_tojson


carsbp=Blueprint("cars","__name__")

@carsbp.route("/api/cars-new")
def get_cars():
    cur=db.cursor()
    location=request.args.get("location")
    cur.execute("select * from vehicles where location=%s ",location)
    details=cur.fetchall()
    cur.execute("commit")
    cur.close()
    if details:
        column_names = [desc[0] for desc in cur.description]
        return convert_tojson(details,column_names),200
    else:
        return jsonify({'message':"there is no cars in the given location"}),401
    

