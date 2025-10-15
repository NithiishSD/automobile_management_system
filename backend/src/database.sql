create database automobile;
show databases;
use automobile;
show tables;
drop table servicetype;
drop table people;
drop table phone_records;
drop table users;
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
create table phone_records(
    id int,
    phone1 integer(10) unique,
    phone2 int(10) unique,
    foreign key(id) references people(pid)
);
create table customer (
    customerid int,
    pid int,
    customertype varchar(10) not null,
    loyaltypoints int default 10,
    primary key(customerid, pid),
    foreign key(pid) references people(pid)
);
create table servicetype(
    serviceid int primary key,
    service_name varchar(20),
    basecost int default 2000,
    description varchar(100),
);
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
create table servicerecord (
    recordid int,
    servicebookid int,
    workdone bool default false,
    servicecost int,
    completiondate date,
    primary key(recordid, servicebookid),
    foreign key(servicebookid) references servicebooking(sid)
);
create table parts_changed_record (
    recordid int,
    partsname varchar(50),
    qty int default 1,
    foreign key(recordid) references servicerecord(recordid)
);
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
    CONSTRAINT fk_newvehicle_vehicle FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId)
);
CREATE TABLE COLORCHOICE (
    VehicleId VARCHAR(50) NOT NULL,
    ColorName VARCHAR(50) UNIQUE NOT NULL,
    PRIMARY KEY (VehicleId),
    CONSTRAINT colorchoice_fk_vehicle FOREIGN KEY (VehicleId) REFERENCES NEWVEHICLE(VehicleId)
);
CREATE TABLE RESALEVEHICLE (
    VehicleId VARCHAR(50) NOT NULL,
    OwnerId INT NOT NULL,
    Condition VARCHAR(50),
    PRIMARY KEY (VehicleId),
    CONSTRAINT fk_resalevehicle_vehicle FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId),
    CONSTRAINT fk_resalevehicle_owner FOREIGN KEY (OwnerId) REFERENCES RESALEOWNER(OwnerId)
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
    CONSTRAINT fk_vehiclehistory_vehicle FOREIGN KEY (VehicleId) REFERENCES RESALEVEHICLE(VehicleId)
);
CREATE TABLE PERFORMANCE (
    VehicleId VARCHAR(50) NOT NULL,
    Transmission VARCHAR(50),
    Drivetrain VARCHAR(50),
    Cylinders INT,
    FuelType VARCHAR(50),
    Mileage DECIMAL(6, 2),
    PRIMARY KEY (VehicleId),
    CONSTRAINT fk_performance_vehicle FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId)
);
CREATE TABLE INVENTORY (
    InventoryId VARCHAR(50) NOT NULL,
    VehicleId VARCHAR(50) NOT NULL,
    StockStatus VARCHAR(50),
    Quantity INT,
    Location VARCHAR(100),
    PRIMARY KEY (InventoryId),
    CONSTRAINT fk_inventory_vehicle FOREIGN KEY (VehicleId) REFERENCES VEHICLE(VehicleId),
    CONSTRAINT chk_quantity_nonnegative CHECK (Quantity >= 0)
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
create table sales(
    salesid int primary key,
    salesdate date not null,
    finalprice float not null,
    vehicleid VARCHAR(50),
    foreign key(vehicleid) references VEHICLE(VehicleId)
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
commit;
