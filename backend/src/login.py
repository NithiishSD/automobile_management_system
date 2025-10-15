from flask import jsonify,request,render_template,Blueprint
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from src import db

loginbp=Blueprint('login',__name__)

@loginbp.route('/auth/login',methods=["POST"])
def login_user():
    userdetails=request.get_json()
    user=userdetails.get("user")
    password=userdetails.get("password")
    
    cur=db.cursor()
    cur.execute("select  * from users where username=%s and password=%s",(user,password))
    y=cur.fetchone()
    print(y)
    cur.execute("commit")
    if y :
        return jsonify({'message':"user found"}),200
    else:
        return jsonify({'message':"user not found"}),401
    
    
    
@loginbp.route('/auth/profile', methods=['GET','PATCH',])
@jwt_required()
def profile():
    if request.methods=='GET':
        current_user_id = get_jwt_identity()
        cur=db.cursor()
        cur.excecute("select id,username from users where id={%s}",current_user_id)
        user=cur.fetchone()
        if user:
            return jsonify({"id": user[0], "username": user[1]}),200
        else:
            return jsonify({'message':"user profile not found"}),401
    