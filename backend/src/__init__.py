from flask import Flask ,render_template,request,jsonify 
from flask_sqlalchemy import SQLAlchemy
import mysql.connector

app=Flask(__name__)
db=mysql.connector.connect(host='localhost',user='root',password='Brindhavanam28#')
if db.is_connected:
    print("db connected")
cur=db.cursor()
cur.execute('use automobile')

from .signup import signupbp

app.register_blueprint(signupbp)

from .login import loginbp

app.register_blueprint(loginbp)
