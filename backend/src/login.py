from flask import jsonify,request
from src import app,cur


@app.route("/api/login",method=["POST","GET"])

def login_user():
    userdetails=request.get_json()
    user=userdetails.get("user")
    password=userdetails.get("password")

    cur.excute("select  * from users where username={%s} and password={%s}",(user,password))
    
    y=cur.fetchall()
    cur.execute("commit")
    if y :
        return jsonify({'message':"user found"}),200
    else:
        return jsonify({'message':"user not found"}),401
    
    
