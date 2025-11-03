use  automobile; 

show triggers;



DELIMITER $$
CREATE TRIGGER after_advance_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
	DECLARE v_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO v_exists FROM advance_payemnt WHERE payment_id = NEW.payid; 
	if v_exists =1 and new.bookid is not Null then
		IF NEW.status = 'success' THEN
		UPDATE orderbooking SET status = 'advance_paid'
		WHERE bookid = NEW.bookid;
		END IF;
    end if;    
END$$
DELIMITER ;
drop trigger after_advance_payment;

delimiter $$
CREATE TRIGGER after_order_delivered
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
	declare sale_id int;
    declare v_vehicleid varchar(50);
    
    declare saledate date;
    declare orderid varchar(100);
    if new.bookid<>Null then 
			select distinct(bookid) into  orderid from payment where  payid =new.payid;
            select vehicleid into v_vehicleid from orderbooking where bookid=orderid;
            update orderbooking set status =' order confirmed' where bookid=orderid;
	end if;
    if new.bookid=Null then
		select resalebookid into orderid from payment where pay=new.payid;
        select vehicleid into v_vehicleid from orderbooking where bookid=orderid;
	end if;
	IF NEW.status = 'Paid' THEN
		INSERT INTO sales (sale_id, orderid, vehicleid, final_amount, saledate)
    VALUES (
      CONCAT('SAL-', UUID()),
      orderid,
      vehicleid,
      NEW.amount,
      NOW() );
	
  END IF;
  
END$$
delimiter;



DELIMITER $$
CREATE TRIGGER update_booking_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    UPDATE sales
    SET finalprice = new.amount
    WHERE salesid = NEW.saleid;
END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER auto_close_service_record
AFTER UPDATE ON servicebooking
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status <> 'Completed' THEN
        UPDATE servicerecord
        SET completiondate = NOW()
        WHERE servicebookid = NEW.serviceid;

        
    END IF;
END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER mark_sales_paid
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    UPDATE orderbooking
    SET payment_status = 'Paid'
    WHERE customerid = NEW.cust_id;
END$$

DELIMITER ;



DELIMITER $$

CREATE  PROCEDURE GetVehicleById(IN v_id varchar(50))
BEGIN
    SELECT 
        v.VehicleId, v.Vin, v.Model,v.brand, v.Cost, v.BasePrice, v.VehicleImageURL,
        p.FuelType, p.Transmission,
        c.ColorName AS Color, 
        nv.YearOfMake AS Year,
        nv.WarrantyPeriod,
        i.StockStatus,
        (SELECT COUNT(*) FROM inventory WHERE VehicleId in ( select VehicleId from vehicle where Model=v.Model and brand=v.brand )) AS Quantity,
        CASE
            WHEN nv.VehicleId IS NOT NULL THEN 'new'
            WHEN rv.VehicleId IS NOT NULL THEN 'used'
            ELSE 'unknown'
        END as Type,
        p.Drivetrain,
        p.Cylinders,
        p.Mileage,
        vh.*
        
    FROM vehicle v
    LEFT JOIN newvehicle nv ON v.VehicleId = nv.VehicleId
    LEFT JOIN resalevehicle rv ON v.VehicleId = rv.VehicleId
    LEFT JOIN inventory i ON v.VehicleId = i.VehicleId
    LEFT JOIN performance p ON v.VehicleId = p.VehicleId
    LEFT JOIN colorchoice c ON v.VehicleId = c.VehicleId
    left join vehiclehistory vh on v.VehicleId= vh.VehicleId
    WHERE v.VehicleId = v_id;
    
END $$

DELIMITER ; 




DELIMITER $$

CREATE TRIGGER trg_decrement_inventory
AFTER INSERT ON orderbooking
FOR EACH ROW
BEGIN
	declare v_exists int ;
    declare v_modal varchar(30);
    declare v_brand varchar(20);
    -- Decrement stock for the vehicle
    UPDATE inventory
    SET stockStatus = 'booked'
    WHERE VehicleId = NEW.VehicleId;
    
	select Model,brand into v_modal,v_brand from vehicle where VehicleId=NEW.VehicleId; 
    -- Optionally, mark status if out of stock
     (SELECT COUNT(*) FROM inventory WHERE VehicleId in ( select VehicleId from vehicle v where Model=v.Model and brand=v.brand )) into v_exists;
    UPDATE inventory
    SET StockStatus = CASE
        WHEN v_exists <= 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END
    WHERE VehicleId = NEW.VehicleId;
END$$

DELIMITER ;
drop trigger trg_decrement_inventory;

DELIMITER $$
CREATE TRIGGER before_resale_update_check
BEFORE UPDATE ON resalevehicle
FOR EACH ROW
BEGIN
    IF NEW.verification NOT IN ('Pending Inspection', 'Verified', 'Rejected') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid verification status';
    END IF;
END$$
  DELIMITER;


DELIMITER $$


CREATE TRIGGER after_resale_booked
AFTER UPDATE ON resalevehicle
FOR EACH ROW
BEGIN
DECLARE v_exists INT DEFAULT 0;
        DECLARE v_transmission VARCHAR(50);
        DECLARE v_fuel VARCHAR(50);
        DECLARE v_mileage DECIMAL(10,2);
        DECLARE v_location VARCHAR(100);
        DECLARE v_runkm INT;
        DECLARE v_desc VARCHAR(255);
        DECLARE v_accident VARCHAR(100);
        declare v_inventoryid  varchar(50);
        declare v_historyid varchar(50);
        declare v_color varchar(10);
        declare v_expected_amount float;
    IF NEW.verification = 'Pending Inspection' OR OLD.verification <> 'Verified' THEN
        
        

        -- Get details from pending_vehicle_details
        SELECT Transmission, FuelType, Mileage, Location, RunKilometers, Description, AccidentHistory,inventoryid,v_history,color,expected_amount
        INTO v_transmission, v_fuel, v_mileage, v_location, v_runkm, v_desc, v_accident,v_inventoryid,v_historyid,v_color,v_expected_amount
        FROM pending_vehicle_details
        WHERE VehicleId = NEW.VehicleId;

        -- Insert into performance
        SELECT COUNT(*) INTO v_exists FROM performance WHERE VehicleId = NEW.VehicleId;
        IF v_exists = 0 THEN
            INSERT INTO performance (VehicleId, Transmission, FuelType, Mileage)
            VALUES (NEW.VehicleId, v_transmission, v_fuel, v_mileage);
        END IF;

        -- Insert into inventory
        SELECT COUNT(*) INTO v_exists FROM inventory WHERE VehicleId = NEW.VehicleId;
        IF v_exists = 0 THEN
            INSERT INTO inventory (InventoryId, VehicleId, StockStatus, Location)
            VALUES (v_inventoryid, NEW.VehicleId, 'Pending', v_location);
        END IF;

       
		SELECT COUNT(*) INTO v_exists FROM colorchoice WHERE VehicleId = NEW.VehicleId; 
        if v_exists =0 then
			insert into colorchoice values(vehicleID,v_color);
		end if;
        SELECT COUNT(*) INTO v_exists FROM resale_booking WHERE Vehicleid = NEW.VehicleId; 
        if v_exists =0 then
			SELECT COUNT(*) INTO v_exists FROM resale_booking ;
			insert into resale_booking values('RS'||v_exists+1,'Pending Inspection',new.ownerid,curdate(),  DATE_ADD(CURDATE(), INTERVAL 3 MONTH),new.vehicleid,v_expected_amount);
		end if;
        -- Cleanup: remove from staging
        DELETE FROM pending_vehicle_details WHERE VehicleId = NEW.VehicleId;
    END IF;
    IF NEW.verification = 'Verified' OR OLD.verification <> 'Verified' THEN
		SELECT COUNT(*) INTO v_exists FROM resale_booking WHERE Vehicleid = NEW.VehicleId; 
        if v_exists =0 then
			SELECT COUNT(*) INTO v_exists FROM resale_booking ;
			insert into resale_booking values('RS'||v_exists+1,'Verified',new.ownerid,curdate(),  DATE_ADD(CURDATE(), INTERVAL 3 MONTH),new.vehicleid,v_expected_amount);
		end if;
         -- Insert into vehiclehistory
        SELECT COUNT(*) INTO v_exists FROM vehiclehistory WHERE VehicleId = NEW.VehicleId;
        IF v_exists = 0 THEN
            INSERT INTO vehiclehistory (HistoryId, VehicleId, RecordDate, VehicleCondition, RunKilometers, ServiceRemarks, AccidentHistory, NumOfOwners)
            VALUES (v_historyid, NEW.VehicleId, CURDATE(), 'Good', v_runkm, v_desc, v_accident, 1);
        END IF;
	end if;
    
END$$

DELIMITER ;

 drop trigger after_resale_booked;

DELIMITER $$
CREATE TRIGGER after_advance_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
  IF NEW.status = 'advance' AND NEW.status = 'success' THEN
    UPDATE orderbooking SET status = 'advance_paid'
    WHERE bookid = NEW.bookid;
  END IF;
END;
DELIMITER ;
