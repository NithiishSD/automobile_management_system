from flask import Blueprint, request, jsonify
from src import db

vehiclebp = Blueprint("vehicles", __name__)

@vehiclebp.route("/api/vehicles", methods=["GET"])
def get_vehicles():
    try:
        vtype = request.args.get("type")
        status = request.args.get("status")
        model = request.args.get("model")
        min_price = request.args.get("min_price")
        max_price = request.args.get("max_price")
        fuel_type = request.args.get("fuel_type")
        transmission = request.args.get("transmission")
        color = request.args.get("color")
        year = request.args.get("year")
        sort_by = request.args.get("sort_by", "v.Model")

        cur = db.cursor()
        query = """select v.VehicleId,v.Model,v.Cost,v.BasePrice,v.VehicleImageURL,p.FuelType,p.Transmission,c.ColorName AS Color,nv.YearOfMake AS Year,i.StockStatus,
                case
                    when nv.VehicleId is not null then 'new'
                    when rv.VehicleId is not null then 'used'
                    else 'unknown'
                end as Type
            from vehicle v
            left join newvehicle nv on v.VehicleId = nv.VehicleId
            left join resalevehicle rv on v.VehicleId = rv.VehicleId
            left join inventory i on v.VehicleId = i.VehicleId
            left join performance p on v.VehicleId = p.VehicleId
            left join colorchoice c on v.VehicleId = c.VehicleId
            where 1=1
        """

        params = []
        if vtype:
            query += " and (case when nv.VehicleId is not null then 'new' when rv.VehicleId is not null then 'used' else 'unknown' end) = %s"
            params.append(vtype.lower())
        if model:
            query += " and v.Model like %s"
            params.append(f"%{model}%")
        if status:
            query += " and i.StockStatus like %s"
            params.append(f"%{status}%")
        if fuel_type:
            query += " and p.FuelType like %s"
            params.append(f"%{fuel_type}%")
        if transmission:
            query += " and p.Transmission like %s"
            params.append(f"%{transmission}%")
        if color:
            query += " and c.ColorName like %s"
            params.append(f"%{color}%")
        if year:
            query += " and nv.YearOfMake = %s"
            params.append(year)
        if min_price:
            query += " and v.BasePrice >= %s"
            params.append(min_price)
        if max_price:
            query += " and v.BasePrice <= %s"
            params.append(max_price)

        allowed_sort = {
            "price": "v.BasePrice",
            "model": "v.Model",
            "year": "nv.YearOfMake"
        }
        sort_column = allowed_sort.get(sort_by.lower(), "v.Model")
        query += f" order by {sort_column} "

        cur.execute(query, tuple(params))
        records = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        cur.close()

        if not records:
            return jsonify({"message": "No vehicles founds matching filters"}), 404

        vehicles = [dict(zip(columns, row)) for row in records]
        return jsonify({"count": len(vehicles), "vehicles": vehicles}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
