import json
import os
from flask import Flask
from flask_jwt_extended import JWTManager
import mysql.connector
app = Flask(__name__)
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')
try:
    with open(CONFIG_PATH) as f:
        config = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"config.json not found at {CONFIG_PATH}")
except json.JSONDecodeError:
    raise RuntimeError("config.json contains invalid JSON")

app.config["JWT_SECRET_KEY"] = config.get("JWT_SECRET_KEY", "default_secret")
jwt = JWTManager(app)
try:
    db = mysql.connector.connect(
        host=config.get("DB_HOST", "localhost"),
        user=config.get("DB_USER", "root"),
        password=config.get("DB_PASSWORD", ""),
        database=config.get("DB_NAME", "")
    )

    if db.is_connected():
        print("Database connected successfully")

except mysql.connector.Error as err:
    print(f"Database connection error: {err}")
    db = None
from .signup import signupbp
from .login import loginbp
from .vehicles import vehiclebp
from .view_user_booking import viewbookingbp

app.register_blueprint(signupbp)
app.register_blueprint(loginbp)
app.register_blueprint(vehiclebp)
app.register_blueprint(viewbookingbp)
app.register_blueprint(viewbookingbp)
