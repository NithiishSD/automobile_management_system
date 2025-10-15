from flask import jsonify
from datetime import datetime
def convert_tojson(lst,cur):
    columns=[desc[0] for desc in cur.description]
    return jsonify( [dict(zip(columns,row)) for row in lst])
def generate_orderid(custid,cnt):
    return f"ORD-{datetime.now().strftime("%Y%m%d")}-{custid}-{cnt+1}"
