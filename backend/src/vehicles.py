from flask import Blueprint,request,jsonify
from src import db
vehiclebp=Blueprint("vehicles","__name__")
cur=db.cursor()
@vehiclebp.route("/api/vehicles",methods=["GET"])
def get_vehicles():
    vehicletype=request.args.get("vehicle")
    
    cur.execute("select vehicleid from vehicle where vehicletype=%s",vehicletype)
    vehicle=cur.fetchone()
    count=cur.execute("select count(*) from vehicle where vehicletype=%s ",vehicletype).fetchone()
    cur.execute("commit")
    if vehicle:
        return jsonify({"vehicleid":vehicle,'count':count})
    else:
        return jsonify({'message':'the vehicle is not found'}),401
    
@vehiclebp.route("/api/vehicle-details",methods=["GET"])
def get_details():
    vid=request.args.get("vehicleid")
    cur.execute("select * from vehicles where vehicleid=%s",vid)
    records=cur.fetchall()
    column_names = [desc[0] for desc in cur.description]

    if records:
        details = [dict(zip(column_names, row)) for row in records]
        return jsonify(details)
    else:
        return jsonify({"message":"they is not record of the given vehicle id"}),404

  
    