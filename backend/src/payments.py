from flask import Blueprint,jsonify,request
from src import db
paymentbp=Blueprint("payments","__name__")






@paymentbp.route('/api/payments', methods=['POST'])
def add_payment():
    data = request.get_json()
    booking_id = data.get('booking_id')
    payment_mode = data.get('payment_mode')
    amount = data.get('amount')
    sale_id =data.get("sales_id")
    status = data.get('status', 'pending')
    if not all([booking_id, payment_mode, amount]):
        return jsonify({"error": "booking_id, payment_mode, and amount are required"}), 400

    try:
        cur = db.cursor()
        cur.execute("""
            INSERT INTO payment (payid,amount, paymentmode,saleid,status)
            VALUES (%s, %s, %s, %s, %s)
        """, ("PAY"+str(booking_id),amount, payment_mode,sale_id,status))
        db.commit()
        payment_id = cur.lastrowid
        cur.close()

        return jsonify({
            "message":  "payment added successfully",
            "payment_id": payment_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
