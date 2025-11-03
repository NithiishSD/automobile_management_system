use  automobile;
show tables;
select * from customer;
select * from performance;
select * from people;
select * from orderbooking;
select * from phone_records; 
select * from users;
delete from people;
drop trigger update_booking_payment_status;
select * from vehicle;
select * from resalevehicle;
select * from resaleowner;
select * from colorchoice;
delete from colorchoice;
delete from vehicle;
SHOW FULL COLUMNS FROM performance LIKE 'FuelType';
SELECT FuelType, HEX(FuelType) AS bad_bytes
FROM performance
WHERE FuelType IS NOT NULL;
SHOW PROCESSLIST;
SELECT FuelType
FROM performance
WHERE FuelType IS NOT NULL;

insert into phone_records values('Pep5','9345497340');



delete from users;
select * from users;
CREATE TABLE vehiclehistory (
  HistoryId VARCHAR(50) NOT NULL PRIMARY KEY,
  VehicleId VARCHAR(50) NOT NULL,
  RecordDate DATE NOT NULL,
  OilCondition VARCHAR(100),
  VehicleCondition VARCHAR(100),
  RunKilometers INT,
  ServiceRemarks VARCHAR(255),
  AccidentHistory VARCHAR(255),
  NumOfOwners INT,
  FOREIGN KEY (VehicleId) REFERENCES resalevehicle(VehicleId)
);
INSERT INTO vehicle (
    VehicleId,
    Vin,brand,
    Model,
    Cost,
    BasePrice,
    VehicleImageURL
  )
VALUES (
    'V001',
    '1HGCM82633A004352',
    'Honda',' City ZX',
    1000000,
    1200000,
    'static/images/pexels-mikebirdy-810357.jpg'
  ),
  (
    'V002',
    '2HGCM82633A004352',
    'Hyundai',' Creta',
    950000,
    1100000,
    '/static/images/pexels-mikebirdy-116675.jpg'
  ),
  (
    'V003',
    '3HGCM82633A004352',
    'Tata ','Nexon',
    850000,
    950000,
    '/static/images/pexels-mikebirdy-170811.jpg'
  );
  INSERT INTO inventory (
    InventoryId,
    VehicleId,
    StockStatus,
    Quantity,
    Location
  )
VALUES (
    'INV001',
    'V001',
    'In Stock',
    5,
    'Chennai Showroom'
  ),
  (
    'INV002',
    'V002',
    'Low Stock',
    2,
    'Bangalore Showroom'
  ),
  ('INV003', 'V003', 'Resale', 1, 'Mumbai Lot');
  commit;
INSERT INTO manufacturer (
    ManufacturerId,
    VehicleId,
    Name,
    Address,
    State,
    PhoneNo
  )
VALUES (
    'M001',
    'V001',
    'Honda India Pvt Ltd',
    'Chennai Industrial Park',
    'Tamil Nadu',
    '044-2345678'
  ),
  (
    'M002',
    'V002',
    'Hyundai Motors India',
    'Irungattukottai',
    'Tamil Nadu',
    '044-3456789'
  );
  INSERT INTO inventory (
    InventoryId,
    VehicleId,
    StockStatus,
    Quantity,
    Location
  )
VALUES (
    'INV001',
    'V001',
    'In Stock',
    5,
    'Chennai Showroom'
  ),
  (
    'INV002',
    'V002',
    'Low Stock',
    2,
    'Bangalore Showroom'
  ),
  ('INV003', 'V003', 'Resale', 1, 'Mumbai Lot');
  INSERT INTO performance (
    VehicleId,
    Transmission,
    Drivetrain,
    Cylinders,
    FuelType,
    Mileage
  )
VALUES ('V001', 'Automatic', 'FWD', 4, 'Petrol', 17.50),
  ('V002', 'Manual', 'FWD', 4, 'Diesel', 21.00),
  ('V003', 'Automatic', 'AWD', 3, 'Electric', 0.00);
  INSERT INTO inventory (
    InventoryId,
    VehicleId,
    StockStatus,
    Location
  )
VALUES (
    'INV001',
    'V001',
    'In Stock',
    'Chennai Showroom'
  ),
  (
    'INV002',
    'V002',
    'Low Stock',
    'Bangalore Showroom'
  ),
  ('INV003', 'V003', 'Resale', 'Mumbai Lot');
  select * from inventory;
  select * from manufacturer;
  select * from newvehicle;
  INSERT INTO newvehicle (VehicleId, YearOfMake, WarrantyPeriod)
VALUES ('V001', 2024, 3),
  ('V002', 2023, 2);
  INSERT INTO colorchoice (VehicleId, ColorName)
VALUES ('V001', 'Pearl White'),
  ('V002', 'Midnight Black');
  select * from colorchoice;
  delete from resaleowner;
  INSERT INTO resaleowner (ownerid, pid) VALUES (301, 'Pep4');
  INSERT INTO resalevehicle (VehicleId, OwnerId, Conditions)
VALUES ('V003', 301, 'Good');
select * from performance;

drop procedure getvehiclebyid;



drop trigger trg_decrement_inventory;
select p.*, r.phone1 as phone  from people p  leftphone_records join phone_records r on p.pid=r.id  where userid=4;
INSERT INTO vehiclehistory (
    HistoryId,
    VehicleId,
    RecordDate,
    OilCondition,
    VehicleCondition,
    RunKilometers,
    ServiceRemarks,
    AccidentHistory,
    NumOfOwners
  )
VALUES (
    'H001',
    'V003',
    '2025-01-10',
    'Clean',
    'Excellent',
    25000,
    'No issues',
    'None',
    1
  );
  select * from vehiclehistory;
  
  
  
  



drop trigger after_resale_verified;

CREATE TABLE pending_vehicle_details (
    VehicleId VARCHAR(50) PRIMARY KEY,
    Transmission VARCHAR(50),
    FuelType VARCHAR(50),
    Mileage DECIMAL(10,2),
    Location VARCHAR(100),
    RunKilometers INT,
    Description VARCHAR(255),
    AccidentHistory VARCHAR(100),
    inventoryid varchar(50),
    v_history varchar(50),
    color varchar(20) );
drop table  pending_vehicle_details;
select * from vehiclehistory;
select * from resalevehicle;
select * from orderbooking;
select * from sales;


SELECT o.*, v.model, v.vin, s.finalprice
FROM orderbooking o
LEFT JOIN sales s ON o.bookid = s.order_id
LEFT JOIN vehicle v ON o.vehicleid = v.vehicleid
WHERE o.customerid = 4
ORDER BY o.booking DESC;
select * from customer;
select * from payment;
SELECT b.bookid,b.booking, p.status,p.paymentmode,p.amount,  v.vehicleId,  v.brand,v.model,c.colorName, v.vin, b.expirydate 
                FROM orderbooking b LEFT JOIN vehicle v ON b.vehicleid = v.vehicleid left join colorchoice c on v.vehicleid=c.vehicleid left join payment p on b.bookid = p.bookid
                    WHERE b.customerid ='CUS1';




