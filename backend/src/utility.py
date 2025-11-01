from flask import jsonify
from datetime import datetime

def convert_tojson(lst,columns):
    return  [dict(zip(columns,row)) for row in lst]

def generate_orderid(custid, cnt):
    if not cnt:
        cnt=0

    date_str = datetime.now().strftime("%Y%m%d")
    return "ORD-" + date_str + "-" + str(custid) + "-" +f"{cnt}"
