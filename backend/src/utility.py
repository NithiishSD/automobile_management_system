from flask import jsonify
def convert_tojson(lst,cur):
    columns=[desc[0] for desc in cur.description]
    return jsonify( [dict(zip(columns,row)) for row in lst])
