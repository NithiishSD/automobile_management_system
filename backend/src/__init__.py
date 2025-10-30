import json
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import mysql.connector

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

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

def create_db_connection():
    """Create a new database connection"""
    try:
        connection = mysql.connector.connect(
            host=config.get("DB_HOST", "localhost"),
            user=config.get("DB_USER", "root"),
            password=config.get("DB_PASSWORD", ""),
            database=config.get("DB_NAME", "automobile"),
            ssl_disabled=True
        )
        
        if connection.is_connected():
            print("✅ Database connected successfully")
            return connection
        else:
            print("❌ Database connection failed")
            return None
            
    except mysql.connector.Error as err:
        print(f"❌ Database connection error: {err}")
        return None

# Create initial connection
db = create_db_connection()

from .signup import signupbp
from .login import loginbp
from .vehicles import vehiclebp
from .view_user_booking import viewbookingbp

app.register_blueprint(signupbp)
app.register_blueprint(loginbp)
app.register_blueprint(vehiclebp)
app.register_blueprint(viewbookingbp)

@app.route('/api/health')
def health_check():
    """Health check endpoint to verify database connection"""
    try:
        if db and db.is_connected():
            return jsonify({"status": "healthy", "database": "connected"})
        else:
            return jsonify({"status": "unhealthy", "database": "disconnected"}), 500
    except:
        return jsonify({"status": "unhealthy", "database": "error"}), 500
