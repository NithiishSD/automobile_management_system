from flask import Flask ,render_template,request,jsonify 
from flask_sqlalchemy import SQLAlchemy
import mysql.connector




app=Flask(__name__)
@app.route("/members",method=["GET","POST"])

def members():
    return "hi i am the members"

@app.route("/home")
def home_page():
    return render_template("home_page.html")





if __name__=="__main__":
    app.run(debug=True)
    
