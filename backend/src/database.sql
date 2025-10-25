CREATE DATABASE IF NOT EXISTS automobile;
USE automobile;

-- Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(10) NOT NULL DEFAULT 'user',
  createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateddate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- People table for personal information
CREATE TABLE people (
  pid VARCHAR(100) NOT NULL PRIMARY KEY,
  firstname VARCHAR(20) NOT NULL,
  lastname VARCHAR(20) NOT NULL,
  email VARCHAR(30) UNIQUE,
  city VARCHAR(20),
  state VARCHAR(20),
  age INT,
  userid INT,
  FOREIGN KEY (userid) REFERENCES users(id)
);

-- Customer table
CREATE TABLE customer (
  customerid VARCHAR(10) NOT NULL,
  pid VARCHAR(100) NOT NULL,
  customertype VARCHAR(10) NOT NULL,
  loyaltypoints INT DEFAULT 10,
  PRIMARY KEY (customerid, pid),
  FOREIGN KEY (pid) REFERENCES people(pid)
);

-- Phone records table
CREATE TABLE phone_records (
  id VARCHAR(100),
  phone1 VARCHAR(15) UNIQUE,
  phone2 VARCHAR(15) UNIQUE,
  FOREIGN KEY (id) REFERENCES people(pid)
);

-- Service type table
CREATE TABLE servicetype(
  serviceid INT PRIMARY KEY
);

-- Vehicle table
CREATE TABLE vehicle (
  VehicleId VARCHAR(50) NOT NULL PRIMARY KEY,
  Vin VARCHAR(17) NOT NULL UNIQUE,
  Model VARCHAR(100) NOT NULL,
  Cost DECIMAL(10, 2),
  BasePrice DECIMAL(10, 2),
  VehicleImageURL VARCHAR(255),
  CONSTRAINT chk_cost_positive CHECK (Cost >= 0),
  CONSTRAINT chk_baseprice_positive CHECK (BasePrice >= 0),
  CONSTRAINT chk_price_vs_cost CHECK (BasePrice >= Cost),
  CONSTRAINT chk_vin_length CHECK (CHAR_LENGTH(Vin) = 17)
);

-- Service booking table
CREATE TABLE servicebooking(
  sid INT AUTO_INCREMENT PRIMARY KEY,
  appointmentdate DATE,
  status VARCHAR(100),
  serviceid INT,
  vehicle_id VARCHAR(50) NOT NULL,
  customer_id VARCHAR(10),
  FOREIGN KEY (serviceid) REFERENCES servicetype(serviceid),
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(VehicleId),
  FOREIGN KEY (customer_id) REFERENCES customer(customerid)
);

-- Employee table
CREATE TABLE employee (
  employeeid VARCHAR(10) NOT NULL,
  pid VARCHAR(100) NOT NULL,
  servicebookid INT,
  hiredate DATE NOT NULL,
  PRIMARY KEY (employeeid, pid),
  FOREIGN KEY (pid) REFERENCES people(pid),
  FOREIGN KEY (servicebookid) REFERENCES servicebooking(sid)
);

-- Resale owner table
CREATE TABLE resaleowner(
  ownerid INT,
  pid VARCHAR(100),
  PRIMARY KEY(ownerid, pid),
  FOREIGN KEY(pid) REFERENCES people(pid)
);

-- New vehicle table
CREATE TABLE newvehicle (
  VehicleId VARCHAR(50) NOT NULL PRIMARY KEY,
  YearOfMake INT,
  WarrantyPeriod INT,
  FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId)
);

-- Color choice table
CREATE TABLE colorchoice (
  VehicleId VARCHAR(50) NOT NULL PRIMARY KEY,
  ColorName VARCHAR(50) NOT NULL UNIQUE,
  FOREIGN KEY (VehicleId) REFERENCES newvehicle(VehicleId)
);

-- Resale vehicle table
CREATE TABLE resalevehicle (
  VehicleId VARCHAR(50) NOT NULL PRIMARY KEY,
  OwnerId INT NOT NULL,
  VehicleCondition VARCHAR(50),
  FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId),
  FOREIGN KEY (OwnerId) REFERENCES resaleowner(OwnerId)
);

-- Vehicle history table
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

-- Performance table
CREATE TABLE performance (
  VehicleId VARCHAR(50) NOT NULL PRIMARY KEY,
  Transmission VARCHAR(50),
  Drivetrain VARCHAR(50),
  Cylinders INT,
  FuelType VARCHAR(50),
  Mileage DECIMAL(6, 2),
  FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId)
);

-- Inventory table
CREATE TABLE inventory (
  InventoryId VARCHAR(50) NOT NULL PRIMARY KEY,
  VehicleId VARCHAR(50) NOT NULL,
  StockStatus VARCHAR(50),
  Quantity INT,
  Location VARCHAR(100),
  FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId),
  CONSTRAINT chk_quantity_nonnegative CHECK (Quantity >= 0)
);

-- Manufacturer table
CREATE TABLE manufacturer (
  ManufacturerId VARCHAR(50) NOT NULL PRIMARY KEY,
  VehicleId VARCHAR(50) NOT NULL,
  Name VARCHAR(100) NOT NULL,
  Address VARCHAR(255),
  State VARCHAR(50),
  PhoneNo VARCHAR(20),
  FOREIGN KEY (VehicleId) REFERENCES newvehicle(VehicleId)
);

-- Order booking table
CREATE TABLE orderbooking(
  bookid INT PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'pending',
  customerid VARCHAR(10),
  booking DATE,
  expirydate DATE,
  vehicleid VARCHAR(50),
  FOREIGN KEY (customerid) REFERENCES customer(customerid),
  FOREIGN KEY (vehicleid) REFERENCES vehicle(VehicleId)
);

-- Advance payment table
CREATE TABLE advance_payment(
  ad_paymentid INT PRIMARY KEY,
  amount FLOAT NOT NULL,
  bookingid INT,
  advancedate DATE,
  FOREIGN KEY (bookingid) REFERENCES servicebooking(sid)
);

-- Payment table
CREATE TABLE payment(
  payid INT PRIMARY KEY,
  amount FLOAT NOT NULL,
  paymentmode VARCHAR(50),
  saleid INT,
  status VARCHAR(20) NOT NULL,
  paymentdate DATE
);

-- Sales table
CREATE TABLE sales (
  salesid INT NOT NULL PRIMARY KEY,
  salesdate DATE NOT NULL,
  finalprice FLOAT NOT NULL,
  vehicleid VARCHAR(50),
  cust_id VARCHAR(10),
  FOREIGN KEY (vehicleid) REFERENCES vehicle(VehicleId),
  FOREIGN KEY (cust_id) REFERENCES customer(customerid)
);

-- Insert sample data
INSERT INTO users (username, password, email, role) VALUES
('john_doe', 'pass123', 'john@example.com', 'user'),
('admin_user', 'admin123', 'admin@example.com', 'admin'),
('mary_smith', 'mary@pass', 'mary@example.com', 'user');

INSERT INTO people (pid, firstname, lastname, email, city, state, age, userid) VALUES
('P001', 'John', 'Doe', 'john.doe@example.com', 'Chennai', 'Tamil Nadu', 30, 1),
('P002', 'Mary', 'Smith', 'mary.smith@example.com', 'Bangalore', 'Karnataka', 28, 2),
('P003', 'Raj', 'Kumar', 'raj.kumar@example.com', 'Mumbai', 'Maharashtra', 35, 3);

INSERT INTO customer (customerid, pid, customertype, loyaltypoints) VALUES
('C1001', 'P001', 'regular', 50),
('C1002', 'P002', 'premium', 100);

INSERT INTO phone_records (id, phone1, phone2) VALUES
('P001', '9876543210', '9876501234'),
('P002', '9998887776', '9997778889'),
('P003', '9123456780', '9123001112');

INSERT INTO servicetype (serviceid) VALUES (101), (102), (103);

INSERT INTO vehicle (VehicleId, Vin, Model, Cost, BasePrice, VehicleImageURL) VALUES
('V001', '1HGCM82633A004352', 'Honda City ZX', 1000000, 1200000, 'https://example.com/honda.jpg'),
('V002', '2HGCM82633A004352', 'Hyundai Creta', 950000, 1100000, 'https://example.com/creta.jpg'),
('V003', '3HGCM82633A004352', 'Tata Nexon', 850000, 950000, 'https://example.com/nexon.jpg');

INSERT INTO servicebooking (sid, appointmentdate, status, serviceid, vehicle_id, customer_id) VALUES
(501, '2025-10-10', 'Scheduled', 101, 'V001', 'C1001'),
(502, '2025-10-15', 'Completed', 102, 'V002', 'C1002');

INSERT INTO employee (employeeid, pid, servicebookid, hiredate) VALUES
('E201', 'P003', 501, '2020-06-12');

INSERT INTO resaleowner (ownerid, pid) VALUES
(301, 'P001'),
(302, 'P002');

INSERT INTO newvehicle (VehicleId, YearOfMake, WarrantyPeriod) VALUES
('V001', 2024, 3),
('V002', 2023, 2);

INSERT INTO colorchoice (VehicleId, ColorName) VALUES
('V001', 'Pearl White'),
('V002', 'Midnight Black');

INSERT INTO resalevehicle (VehicleId, OwnerId, VehicleCondition) VALUES
('V003', 301, 'Good');

INSERT INTO vehiclehistory (HistoryId, VehicleId, RecordDate, OilCondition, VehicleCondition, RunKilometers, ServiceRemarks, AccidentHistory, NumOfOwners) VALUES
('H001', 'V003', '2025-01-10', 'Clean', 'Excellent', 25000, 'No issues', 'None', 1);

INSERT INTO performance (VehicleId, Transmission, Drivetrain, Cylinders, FuelType, Mileage) VALUES
('V001', 'Automatic', 'FWD', 4, 'Petrol', 17.50),
('V002', 'Manual', 'FWD', 4, 'Diesel', 21.00),
('V003', 'Automatic', 'AWD', 3, 'Electric', 0.00);

INSERT INTO inventory (InventoryId, VehicleId, StockStatus, Quantity, Location) VALUES
('INV001', 'V001', 'In Stock', 5, 'Chennai Showroom'),
('INV002', 'V002', 'Low Stock', 2, 'Bangalore Showroom'),
('INV003', 'V003', 'Resale', 1, 'Mumbai Lot');

INSERT INTO manufacturer (ManufacturerId, VehicleId, Name, Address, State, PhoneNo) VALUES
('M001', 'V001', 'Honda India Pvt Ltd', 'Chennai Industrial Park', 'Tamil Nadu', '044-2345678'),
('M002', 'V002', 'Hyundai Motors India', 'Irungattukottai', 'Tamil Nadu', '044-3456789');

INSERT INTO orderbooking (bookid, status, customerid, booking, expirydate, vehicleid) VALUES
(401, 'confirmed', 'C1001', '2025-10-05', '2025-11-05', 'V001'),
(402, 'pending', 'C1002', '2025-10-10', '2025-11-10', 'V002');

INSERT INTO advance_payment (ad_paymentid, amount, bookingid, advancedate) VALUES
(601, 5000, 501, '2025-10-05'),
(602, 7000, 502, '2025-10-08');

INSERT INTO payment (payid, amount, paymentmode, saleid, status, paymentdate) VALUES
(701, 1200000, 'Online', 401, 'Success', '2025-10-06'),
(702, 950000, 'Card', 402, 'Pending', '2025-10-10');

INSERT INTO sales (salesid, salesdate, finalprice, vehicleid, cust_id) VALUES
(801, '2025-10-06', 1200000, 'V001', 'C1001'),
(802, '2025-10-10', 950000, 'V002', 'C1002');

-- First, drop the foreign key constraint from resalevehicle
ALTER TABLE resalevehicle DROP FOREIGN KEY resalevehicle_ibfk_2;

-- Modify resaleowner to auto-increment
ALTER TABLE resaleowner MODIFY COLUMN ownerid INT AUTO_INCREMENT;

-- Re-add the foreign key constraint
ALTER TABLE resalevehicle ADD CONSTRAINT resalevehicle_ibfk_2 
    FOREIGN KEY (OwnerId) REFERENCES resaleowner(ownerid);

COMMIT;