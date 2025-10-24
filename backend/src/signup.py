from flask import jsonify, request, Blueprint
from src import db
from flask_jwt_extended import create_access_token
import datetime
signupbp = Blueprint('signup', __name__)

@signupbp.route('/api/auth/signup', methods=["POST"])
def signup_user():
    userdetails = request.get_json()
    user = userdetails.get("user")
    password = userdetails.get("password")
    email = userdetails.get("email")
    role = userdetails.get("role", "user")
   
    if not user or not password or not email:
        return jsonify({'message': "username, password, and email are required"}), 400

    cur = db.cursor()

    cur.execute("SELECT * FROM users WHERE username=%s", (user,))
    existing_user = cur.fetchone()
    if existing_user:
        return jsonify({'message': "username already taken"}), 409

    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    existing_email = cur.fetchone()
    if existing_email:
        return jsonify({'message': "email already registered"}), 409

    # Get the maximum id
    cur.execute("SELECT MAX(id) FROM users")
    max_id = cur.fetchone()[0]
    # Set new id (1 if no existing users)
    new_id = 1 if max_id is None else max_id + 1
    # Insert with the new id
    cur.execute("INSERT INTO users (id, username, password, email, role, createddate) VALUES (%s, %s, %s, %s, %s, %s)",
                (new_id, user, password, email, role,datetime.now()))
    db.commit()
    cur.close()

    access_token = create_access_token(identity=user)
    return jsonify({
        'message': "User created successfully",
    'token': access_token,
    'user':{
            "name": userdetails.get('user'),
            "email": userdetails.get('email'),
            "phone": userdetails.get('phone'),
    } # include user details if needed
}), 201
