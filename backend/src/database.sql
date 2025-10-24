CREATE DATABASE IF NOT EXISTS automobile;
USE automobile;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateddate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE people(
    pid INT PRIMARY KEY,
    firstname VARCHAR(20) NOT NULL,
    lastname VARCHAR(20) NOT NULL,
    email VARCHAR(30) UNIQUE,
    city VARCHAR(20) NOT NULL,
    state VARCHAR(20) NOT NULL,
    age INT NOT NULL
);

CREATE TABLE phone_records (
    id INT,
    phone1 VARCHAR(15) UNIQUE,
    phone2 VARCHAR(15) UNIQUE,
    FOREIGN KEY (id) REFERENCES people(pid)
);

CREATE TABLE customer (
    customerid INT,
    pid INT,
    customertype VARCHAR(10) NOT NULL,
    loyaltypoints INT DEFAULT 10,
    PRIMARY KEY (customerid, pid),
    FOREIGN KEY (pid) REFERENCES people(pid)
);


CREATE TABLE servicetype(
    serviceid INT PRIMARY KEY
);


CREATE TABLE vehicle (
    VehicleId VARCHAR(50) NOT NULL,
    Vin VARCHAR(17) NOT NULL,
    Model VARCHAR(100) NOT NULL,
    Cost DECIMAL(10, 2),
    BasePrice DECIMAL(10, 2),
    VehicleImageURL VARCHAR(255),
    PRIMARY KEY (VehicleId),
    CONSTRAINT uq_vin UNIQUE (Vin),
    CONSTRAINT chk_cost_positive CHECK (Cost >= 0),
    CONSTRAINT chk_baseprice_positive CHECK (BasePrice >= 0),
    CONSTRAINT chk_price_vs_cost CHECK (BasePrice >= Cost),
    CONSTRAINT chk_vin_length CHECK (CHAR_LENGTH(Vin) = 17)
);


CREATE TABLE servicebooking(
    sid INT AUTO_INCREMENT PRIMARY KEY,
    appointmentdate DATE,
    status BOOL,
    serviceid INT,
    vehicle_id VARCHAR(50),
    customer_id INT,
    FOREIGN KEY (serviceid) REFERENCES servicetype(serviceid),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(VehicleId),
    FOREIGN KEY (customer_id) REFERENCES customer(customerid)
);

CREATE TABLE employee (
    employeeid INT,
    pid INT,
    servicebookid INT,
    hiredate DATE NOT NULL,
    PRIMARY KEY (employeeid, pid),
    FOREIGN KEY (pid) REFERENCES people(pid),
    FOREIGN KEY (servicebookid) REFERENCES servicebooking(sid)
);

CREATE TABLE resaleowner(
    ownerid INT,
    pid INT,
    PRIMARY KEY(ownerid, pid),
    FOREIGN KEY(pid) REFERENCES people(pid)
);

CREATE TABLE newvehicle (
    VehicleId VARCHAR(50) NOT NULL,
    YearOfMake INT,
    WarrantyPeriod INT,
    PRIMARY KEY (VehicleId),
    FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId)
);

CREATE TABLE colorchoice (
    VehicleId VARCHAR(50) NOT NULL,
    ColorName VARCHAR(50) UNIQUE NOT NULL,
    PRIMARY KEY (VehicleId),
    FOREIGN KEY (VehicleId) REFERENCES newvehicle(VehicleId)
);

CREATE TABLE resalevehicle (
    VehicleId VARCHAR(50) NOT NULL,
    OwnerId INT NOT NULL,
    VehicleCondition VARCHAR(50),
    PRIMARY KEY (VehicleId),
    FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId),
    FOREIGN KEY (OwnerId) REFERENCES resaleowner(OwnerId)
);

CREATE TABLE vehiclehistory (
    HistoryId VARCHAR(50) NOT NULL,
    VehicleId VARCHAR(50) NOT NULL,
    RecordDate DATE NOT NULL,
    OilCondition VARCHAR(100),
    VehicleCondition VARCHAR(100),
    RunKilometers INT,
    ServiceRemarks VARCHAR(255),
    AccidentHistory VARCHAR(255),
    NumOfOwners INT,
    PRIMARY KEY (HistoryId),
    FOREIGN KEY (VehicleId) REFERENCES resalevehicle(VehicleId)
);

CREATE TABLE performance (
    VehicleId VARCHAR(50) NOT NULL,
    Transmission VARCHAR(50),
    Drivetrain VARCHAR(50),
    Cylinders INT,
    FuelType VARCHAR(50),
    Mileage DECIMAL(6, 2),
    PRIMARY KEY (VehicleId),
    FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId)
);

CREATE TABLE inventory (
    InventoryId VARCHAR(50) NOT NULL,
    VehicleId VARCHAR(50) NOT NULL,
    StockStatus VARCHAR(50),
    Quantity INT,
    Location VARCHAR(100),
    PRIMARY KEY (InventoryId),
    FOREIGN KEY (VehicleId) REFERENCES vehicle(VehicleId),
    CONSTRAINT chk_quantity_nonnegative CHECK (Quantity >= 0)
);

CREATE TABLE manufacturer (
    ManufacturerId VARCHAR(50) NOT NULL,
    VehicleId VARCHAR(50) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(255),
    State VARCHAR(50),
    PhoneNo VARCHAR(20),
    PRIMARY KEY (ManufacturerId),
    FOREIGN KEY (VehicleId) REFERENCES newvehicle(VehicleId)
);

CREATE TABLE orderbooking(
    bookid INT PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'pending',
    customerid INT,
    booking DATE,
    expirydate DATE,
    vehicleid VARCHAR(50),
    FOREIGN KEY (customerid) REFERENCES customer(customerid),
    FOREIGN KEY (vehicleid) REFERENCES vehicle(VehicleId)
);

CREATE TABLE advance_payment(
    ad_paymentid INT PRIMARY KEY,
    amount FLOAT NOT NULL,
    bookingid INT,
    advancedate DATE,
    FOREIGN KEY (bookingid) REFERENCES servicebooking(sid)
);

CREATE TABLE payment(
    payid INT PRIMARY KEY,
    amount FLOAT NOT NULL,
    paymentmode VARCHAR(50),
    saleid INT,
    status VARCHAR(20) NOT NULL,
    paymentdate DATE
);

-- USERS
INSERT INTO users (username, password, email, role)
VALUES 
('john_doe', 'pass123', 'john@example.com', 'user'),
('admin_user', 'admin123', 'admin@example.com', 'admin'),
('mary_smith', 'mary@pass', 'mary@example.com', 'user');

-- PEOPLE
INSERT INTO people (pid, firstname, lastname, email, city, state, age)
VALUES
(1, 'John', 'Doe', 'john.doe@example.com', 'Chennai', 'Tamil Nadu', 30),
(2, 'Mary', 'Smith', 'mary.smith@example.com', 'Bangalore', 'Karnataka', 28),
(3, 'Raj', 'Kumar', 'raj.kumar@example.com', 'Mumbai', 'Maharashtra', 35);

-- PHONE RECORDS
INSERT INTO phone_records (id, phone1, phone2)
VALUES
(1, '9876543210', '9876501234'),
(2, '9998887776', '9997778889'),
(3, '9123456780', '9123001112');

-- CUSTOMER
INSERT INTO customer (customerid, pid, customertype, loyaltypoints)
VALUES
(1001, 1, 'regular', 50),
(1002, 2, 'premium', 100);

-- SERVICETYPE
INSERT INTO servicetype (serviceid) VALUES (101), (102), (103);

-- VEHICLE
INSERT INTO vehicle (VehicleId, Vin, Model, Cost, BasePrice, VehicleImageURL)
VALUES
('V001', '1HGCM82633A004352', 'Honda City ZX', 1000000, 1200000, 'https://example.com/honda.jpg'),
('V002', '2HGCM82633A004352', 'Hyundai Creta', 950000, 1100000, 'https://example.com/creta.jpg'),
('V003', '3HGCM82633A004352', 'Tata Nexon', 850000, 950000, 'https://example.com/nexon.jpg');

-- SERVICEBOOKING
INSERT INTO servicebooking (sid, appointmentdate, status, serviceid, vehicle_id, customer_id)
VALUES
(501, '2025-10-10', TRUE, 101, 'V001', 1001),
(502, '2025-10-15', FALSE, 102, 'V002', 1002);

-- EMPLOYEE
INSERT INTO employee (employeeid, pid, servicebookid, hiredate)
VALUES
(201, 3, 501, '2020-06-12');

-- RESALEOWNER
INSERT INTO resaleowner (ownerid, pid)
VALUES
(301, 1),
(302, 2);

-- NEWVEHICLE
INSERT INTO newvehicle (VehicleId, YearOfMake, WarrantyPeriod)
VALUES
('V001', 2024, 3),
('V002', 2023, 2);

-- COLORCHOICE
INSERT INTO colorchoice (VehicleId, ColorName)
VALUES
('V001', 'Pearl White'),
('V002', 'Midnight Black');

-- RESALEVEHICLE
INSERT INTO resalevehicle (VehicleId, OwnerId, VehicleCondition)
VALUES
('V003', 301, 'Good');

-- VEHICLEHISTORY
INSERT INTO vehiclehistory (HistoryId, VehicleId, RecordDate, OilCondition, VehicleCondition, RunKilometers, ServiceRemarks, AccidentHistory, NumOfOwners)
VALUES
('H001', 'V003', '2025-01-10', 'Clean', 'Excellent', 25000, 'No issues', 'None', 1);

-- PERFORMANCE
INSERT INTO performance (VehicleId, Transmission, Drivetrain, Cylinders, FuelType, Mileage)
VALUES
('V001', 'Automatic', 'FWD', 4, 'Petrol', 17.50),
('V002', 'Manual', 'FWD', 4, 'Diesel', 21.00),
('V003', 'Automatic', 'AWD', 3, 'Electric', 0.00);

-- INVENTORY
INSERT INTO inventory (InventoryId, VehicleId, StockStatus, Quantity, Location)
VALUES
('INV001', 'V001', 'In Stock', 5, 'Chennai Showroom'),
('INV002', 'V002', 'Low Stock', 2, 'Bangalore Showroom'),
('INV003', 'V003', 'Resale', 1, 'Mumbai Lot');

-- MANUFACTURER
INSERT INTO manufacturer (ManufacturerId, VehicleId, Name, Address, State, PhoneNo)
VALUES
('M001', 'V001', 'Honda India Pvt Ltd', 'Chennai Industrial Park', 'Tamil Nadu', '044-2345678'),
('M002', 'V002', 'Hyundai Motors India', 'Irungattukottai', 'Tamil Nadu', '044-3456789');

-- ORDERBOOKING
INSERT INTO orderbooking (bookid, status, customerid, booking, expirydate, vehicleid)
VALUES
(401, 'confirmed', 1001, '2025-10-05', '2025-11-05', 'V001'),
(402, 'pending', 1002, '2025-10-10', '2025-11-10', 'V002');

-- ADVANCE_PAYMENT
INSERT INTO advance_payment (ad_paymentid, amount, bookingid, advancedate)
VALUES
(601, 5000, 501, '2025-10-05'),
(602, 7000, 502, '2025-10-08');

-- PAYMENT
INSERT INTO payment (payid, amount, paymentmode, saleid, status, paymentdate)
VALUES
(701, 1200000, 'Online', 401, 'Success', '2025-10-06'),
(702, 950000, 'Card', 402, 'Pending', '2025-10-10');

COMMIT;
