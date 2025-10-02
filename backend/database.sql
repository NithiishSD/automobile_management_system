create database automobile;
show databases;
use automobile;
show tables;
drop table people;
create table people(
    id int primary key,
    firstname varchar(20) not null,
    lastname varchar(20) not null,
    phone_id int not null,
    email varchar(30) unique,
    city varchar(20) not null,
    state varchar(20) not null,
    age int not null,
    employee_id int unique,
    customerid int unique
);
commit;
