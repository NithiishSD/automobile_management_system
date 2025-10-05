import json
from flask import Flask
from flask_jwt_extended import JWTManager
import mysql.connector
import os

app = Flask(__name__)

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
    config = json.load(f)

app.config["JWT_SECRET_KEY"] = config["JWT_SECRET_KEY"]
jwt = JWTManager(app)

db = mysql.connector.connect(
    host=config["DB_HOST"],
    user=config["DB_USER"],
    password=config["DB_PASSWORD"],
    database=config["DB_NAME"]
)

if db.is_connected():
    print("DB connected")

cur = db.cursor()

from .signup import signupbp
app.register_blueprint(signupbp)

from .login import loginbp
app.register_blueprint(loginbp)
