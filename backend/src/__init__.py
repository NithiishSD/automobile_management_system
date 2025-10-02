from flask import Flask ,render_template,request,jsonify 
from flask_sqlalchemy import SQLAlchemy
import mysql.connector

db=mysql.connector.connect(host='localhost',user='root',password='msc24pw24')



if db.is_connected:
    print("connected")

cur=db.cursor()
cur.execute('use automobile')
cur.execute("commit")
app=Flask(__name__)
