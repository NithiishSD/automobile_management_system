from flask import jsonify, request, Blueprint
from src import db
from flask_jwt_extended import create_access_token

signupbp = Blueprint('signup', __name__)

@signupbp.route('/signup', methods=["POST"])
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

    cur.execute("INSERT INTO users (username, password, email, role) VALUES (%s, %s, %s, %s)",(user, password, email, role))
    cur.commit()
    cur.close()

    access_token = create_access_token(identity=user)
    return jsonify({'message': "user created successfully",'access_token': access_token}), 201
