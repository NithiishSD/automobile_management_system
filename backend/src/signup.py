from flask import jsonify, request, Blueprint
from . import db

signupbp = Blueprint('signup', __name__)

@signupbp.route('/signup', methods=["POST"])
def signup_user():
    userdetails = request.get_json()
    user = userdetails.get("user")
    password = userdetails.get("password")

    cur = db.cursor()

    # Check if user already exists
    cur.execute("select * from users where username=%s", (user,))
    existing_user = cur.fetchone()
    if existing_user:
        return jsonify({'message': "username already taken"}), 409

    # Insert new user
    cur.execute("INSERT INTO users (username, password) values (%s, %s)", (user, password))
    db.commit()
    return jsonify({'message': "user created successfully"}), 201
