create database automobile;
show databases;
use automobile;
show tables;
drop table servicetype;
drop table people;
drop table phone_records;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    createddate DATETIME DEFAULT CURRENT_TIMESTAMP,
    updateddate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
drop table users;
create table people(
    pid int primary key,
    firstname varchar(20) not null,
    lastname varchar(20) not null,
    email varchar(30) unique,
    city varchar(20) not null,
    state varchar(20) not null,
    age int not null
);

CREATE TABLE phone_records (
    id INT,
    phone1 VARCHAR(15) UNIQUE,
    phone2 VARCHAR(15) UNIQUE,
    FOREIGN KEY (id) REFERENCES people(pid)
);
create table customer (
    customerid int,
    pid int,
    customertype varchar(10) not null,
    loyaltypoints int default 10,
    primary key(customerid, pid),
    foreign key(pid) references people(pid)
);
create table servicetype(serviceid int primary key);
create table servicebooking(
    sid int primary key,
    appointmentdate date,
    status bool,
    serviceid int,
    foreign key(serviceid) references servicetype(serviceid)
);
create table employee (
    employeeid int,
    pid int,
    servicebookid int,
    hiredate date not null,
    primary key(employeeid, pid),
    foreign key(pid) references people(pid),
    foreign key(servicebookid) references servicebooking(sid)
);
create table resaleowner(
    ownerid int,
    pid int,
    primary key(ownerid, pid),
    foreign key(pid) references people(pid)
);
ALTER TABLE users MODIFY id INT AUTO_INCREMENT PRIMARY KEY;

CREATE TABLE VEHICLE (
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

CREATE TABLE NEWVEHICLE (
    VehicleId VARCHAR(50) NOT NULL,
    YearOfMake INT,
    WarrantyPeriod INT,
    PRIMARY KEY (VehicleId),
    CONSTRAINT fk_newvehicle_vehicle
        FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId)
);

CREATE TABLE COLORCHOICE (
    VehicleId VARCHAR(50) NOT NULL,
    ColorName VARCHAR(50) UNIQUE NOT NULL,
    PRIMARY KEY (VehicleId),
    CONSTRAINT colorchoice_fk_vehicle
        FOREIGN KEY (VehicleId) REFERENCES NEWVEHICLE(VehicleId)
);

CREATE TABLE RESALEVEHICLE (
    VehicleId VARCHAR(50) NOT NULL,
    OwnerId INT NOT NULL,
    Condition1 VARCHAR(50),
    PRIMARY KEY (VehicleId),
    CONSTRAINT fk_resalevehicle_vehicle 
        FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId),
    CONSTRAINT fk_resalevehicle_owner 
        FOREIGN KEY (OwnerId) REFERENCES RESALEOWNER(OwnerId)
);

CREATE TABLE VEHICLEHISTORY (
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
    CONSTRAINT fk_vehiclehistory_vehicle
        FOREIGN KEY (VehicleId) REFERENCES RESALEVEHICLE(VehicleId)
);

CREATE TABLE PERFORMANCE (
    VehicleId VARCHAR(50) NOT NULL,
    Transmission VARCHAR(50),
    Drivetrain VARCHAR(50),
    Cylinders INT,
    FuelType VARCHAR(50),
    Mileage DECIMAL(6, 2),
    PRIMARY KEY (VehicleId),
    CONSTRAINT fk_performance_vehicle
        FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId)
);

CREATE TABLE INVENTORY (
    InventoryId VARCHAR(50) NOT NULL,
    VehicleId VARCHAR(50) NOT NULL,
    StockStatus VARCHAR(50),
    Quantity INT,
    Location VARCHAR(100),
    PRIMARY KEY (InventoryId),
    CONSTRAINT fk_inventory_vehicle
        FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId),
    CONSTRAINT chk_quantity_nonnegative
        CHECK (Quantity >= 0)
);

CREATE TABLE MANUFACTURER (
    ManufacturerId VARCHAR(50) NOT NULL,
    VehicleId VARCHAR(50) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(255),
    State VARCHAR(50),
    PhoneNo VARCHAR(20),
    PRIMARY KEY (ManufacturerId),
    CONSTRAINT fk_manufacturer_newvehicle FOREIGN KEY (VehicleId) REFERENCES NEWVEHICLE(VehicleId)
);

create table orderbooking(
    bookid int primary key,
    status varchar(20) default 'pending',
    customerid int,
    booking date,
    expirydate date,
    foreign key(customerid) references customer(customerid)
);
create table advance_payment(
    ad_paymentid int primary key,
    amount float not null,
    bookingid int,
    advancedate date,
    foreign key(bookingid) references servicebooking(sid)
);
create table payment(
    payid int primary key,
    amount float not null,
    paymentmode varchar(50),
    saleid int,
    status varchar(20) not null,
    paymentdate date
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

-- PHONE_RECORDS
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

-- SERVICEBOOKING
INSERT INTO servicebooking (sid, appointmentdate, status, serviceid)
VALUES
(501, '2025-10-10', TRUE, 101),
(502, '2025-10-15', FALSE, 102);

-- EMPLOYEE
INSERT INTO employee (employeeid, pid, servicebookid, hiredate)
VALUES
(201, 3, 501, '2020-06-12');

-- RESALEOWNER
INSERT INTO resaleowner (ownerid, pid)
VALUES
(301, 1),
(302, 2);

-- VEHICLE
INSERT INTO VEHICLE (VehicleId, Vin, Model, Cost, BasePrice, VehicleImageURL)
VALUES
('V001', '1HGCM82633A004352', 'Honda City ZX', 1000000, 1200000, 'https://example.com/honda.jpg'),
('V002', '2HGCM82633A004352', 'Hyundai Creta', 950000, 1100000, 'https://example.com/creta.jpg'),
('V003', '3HGCM82633A004352', 'Tata Nexon', 850000, 950000, 'https://example.com/nexon.jpg');

-- NEWVEHICLE
INSERT INTO NEWVEHICLE (VehicleId, YearOfMake, WarrantyPeriod)
VALUES
('V001', 2024, 3),
('V002', 2023, 2);

-- COLORCHOICE
INSERT INTO COLORCHOICE (VehicleId, ColorName)
VALUES
('V001', 'Pearl White'),
('V002', 'Midnight Black');

-- RESALEVEHICLE
INSERT INTO RESALEVEHICLE (VehicleId, OwnerId, Condition1)
VALUES
('V003', 301, 'Good');

-- VEHICLEHISTORY
INSERT INTO VEHICLEHISTORY (HistoryId, VehicleId, RecordDate, OilCondition, VehicleCondition, RunKilometers, ServiceRemarks, AccidentHistory, NumOfOwners)
VALUES
('H001', 'V003', '2025-01-10', 'Clean', 'Excellent', 25000, 'No issues', 'None', 1);

-- PERFORMANCE
INSERT INTO PERFORMANCE (VehicleId, Transmission, Drivetrain, Cylinders, FuelType, Mileage)
VALUES
('V001', 'Automatic', 'FWD', 4, 'Petrol', 17.50),
('V002', 'Manual', 'FWD', 4, 'Diesel', 21.00),
('V003', 'Automatic', 'AWD', 3, 'Electric', 0.00);

-- INVENTORY
INSERT INTO INVENTORY (InventoryId, VehicleId, StockStatus, Quantity, Location)
VALUES
('INV001', 'V001', 'In Stock', 5, 'Chennai Showroom'),
('INV002', 'V002', 'Low Stock', 2, 'Bangalore Showroom'),
('INV003', 'V003', 'Resale', 1, 'Mumbai Lot');

-- MANUFACTURER
INSERT INTO MANUFACTURER (ManufacturerId, VehicleId, Name, Address, State, PhoneNo)
VALUES
('M001', 'V001', 'Honda India Pvt Ltd', 'Chennai Industrial Park', 'Tamil Nadu', '044-2345678'),
('M002', 'V002', 'Hyundai Motors India', 'Irungattukottai', 'Tamil Nadu', '044-3456789');

-- ORDERBOOKING
INSERT INTO orderbooking (bookid, status, customerid, booking, expirydate)
VALUES
(401, 'confirmed', 1001, '2025-10-05', '2025-11-05'),
(402, 'pending', 1002, '2025-10-10', '2025-11-10');

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

alter table orderbooking
add column vehicleid varchar(50),
add foreign key (vehicleid) references vehicle(VehicleId);

update orderbooking set vehicleid = 'V001' where bookid = 401;
update orderbooking set vehicleid = 'V002' where bookid = 402;

commit;
