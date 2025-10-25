from flask import jsonify,request,render_template,Blueprint
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from src import db

loginbp=Blueprint('login',__name__)

@loginbp.route('/api/auth/login', methods=["POST"])
def login_user():
    userdetails = request.get_json()
    username = userdetails.get("user")
    password = userdetails.get("password")

    if not username or not password:
        return jsonify({'message': "Username and password required"}), 400

    cur = db.cursor(dictionary=True)  # fetch as dictionary for easier access
    cur.execute("SELECT * FROM users WHERE username=%s AND password=%s", (username, password))
    user = cur.fetchone()
    cur.close()

    if user:
        # create JWT token
        access_token = create_access_token(identity=username)

        return jsonify({
            'message': "Login successful",
            'token': access_token,
            'user': {
                "username": user["username"],
                "email": user["email"],
                "phone": user.get("phone"),  # optional
                "role": user.get("role")
            }
        }), 200
    else:
        return jsonify({'message': "Invalid username or password"}), 401
    
    
@loginbp.route('/api/auth/profile', methods=['GET','PATCH'])
@jwt_required()
def profile():
    cur=db.cursor()
    if request.methods=='GET':
        current_user_id = get_jwt_identity()
        cur=db.execute()
        cur.excecute("select id,username from users where id={%s}",current_user_id)
        db.commit()
        cur.close()
        user=cur.fetchone()
        if user:
            return jsonify({"id": user[0], "username": user[1]}),200
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

        cur.execute(update_query, tuple(update_values))
        db.commit()
        cur.close()

        return jsonify({'message': 'Profile updated successfully'}), 200

@loginbp.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT blacklisting would be implemented here if needed
     return jsonify({'message': 'Successfully logged out'}), 200
