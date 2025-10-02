import mysql.connector
import json

db=mysql.connector.connect(host='localhost',user='root',password='msc24pw24')

if db.is_connected:
    print("connected")
    cur=db.cursor()
    cur.execute('use automobile')
    cur.execute('select *  from people')
    z=cur.fetchall()
    users = [ dict((("id", row[0]), ("count",row[1]))) for row in z]
    print(json.dumps({"error":400},{}))
    db.close()
else :
    print("not connected")

