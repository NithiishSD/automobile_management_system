create database automobile;
show databases;
use automobile;
show tables;
drop table servicetype;
drop table people;
drop table phone_records;
create table users(
    username varchar(30) unique not null,
    password varchar(20) not null
);
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
commit;
