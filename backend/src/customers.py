from flask import Flask,jsonify,Blueprint 

customerbp=Blueprint("customers","__name__")

@customerbp.route("/api/customer/<int:id>")
def search_customer(id):
    pass
    
