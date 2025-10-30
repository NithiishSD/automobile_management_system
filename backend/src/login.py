from flask import jsonify,request,render_template,Blueprint
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import check_password_hash
from datetime import timedelta
from src import db,jwt

loginbp=Blueprint('login',__name__)
token_blacklist = set()

# Login route
@loginbp.route('/api/auth/login', methods=["POST"])
def login_user():
    userdetails = request.get_json()
    username = userdetails.get("user")
    password = userdetails.get("password")

    if not username or not password:
        return jsonify({'message': "Username and password required"}), 400

    cur = db.cursor(dictionary=True)
    # Only fetch user by username - check password separately
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    db.commit()

    if not user:
        return jsonify({'message': "Invalid username"}), 401
    
    # Verify password (assuming passwords are hashed in database)
    # If not hashed yet, see migration code below
    cur.execute("select  * from users where username=%s and password=%s",(username,password))
    y=cur.fetchone()
    cur.execute("commit")

    if not y :
        return jsonify({'message': "Invalid usernameeee or password"}), 401

    # Create JWT tokens with additional claims
    additional_claims = {
        "role": user.get("role"),
        "email": user.get("email")
    }
    
    access_token = create_access_token(
        identity=str(user.get("id")),
        additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(identity=str(user.get("id")))

    return jsonify({
        'message': "Login successful",
        'token': access_token,
        'refresh_token': refresh_token,
        'user': {
            "username": user["username"],
            "email": user["email"],
            "phone": user.get("phone"),
            "role": user.get("role")
        }
    }), 200


# Logout route
@loginbp.route('/api/auth/logout', methods=["POST"])
@jwt_required()
def logout_user():
    jti = get_jwt()['jti']  # JWT ID - unique identifier for the token
    token_blacklist.add(jti)
    return jsonify({'message': "Successfully logged out"}), 200

@loginbp.route('/api/auth/profile', methods=['GET','PATCH'])
@jwt_required()
def profile():
    if request.methods=='GET':
        current_user_id = get_jwt_identity()
        cur=db.cursor(dictionary=True)
        cur.excecute("select *  from people where pid in (select pid from user where id={%s})",current_user_id)
        db.commit()
        cur.close()
        user=cur.fetchone()
        if user:
            return jsonify({"id": current_user_id, "username": user[1]}),200
        else:
            return jsonify({'message':"user profile not found"}),401
    elif request.method == 'PATCH':

        current_user_id = get_jwt_identity()
        updated_data = request.get_json()
        username = updated_data.get("name")
        email = updated_data.get("email")
        phone = updated_data.get("phone")
        age=updated_data.get("age")
        city=updated_data.get("city")
        state=updated_data.get("state")
        update_query = "UPDATE people SET "
        update_values = []
       
        if email:
            update_query += "email=%s, "
            update_values.append(email)
        if phone:
            update_query += "phone=%s, "
            update_values.append(phone)
        
        if age:
            update_query += "age=%s, "
            update_values.append(age)
        if city:
            update_query += "city=%s, "
            update_values.append(city)
        if state:
            update_query += "state=%s, "
            update_values.append(state)
        update_query = update_query.rstrip(", ") + " WHERE id=%s"
        update_values.append(current_user_id)
        cur=db.cursor()
        cur.execute(update_query, tuple(update_values))
        db.commit()
        cur.close()

        return jsonify({'message': 'Profile updated successfully'}), 200

# simple in-memory blocklist (use persistent store in production)
token_blocklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in token_blocklist

@loginbp.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    token_blocklist.add(jti)
    return jsonify({"message": "Successfully logged out"}), 200
