create database emp_trackerdb;

use emp_trackerdb;

create table department (
	id int primary key auto_increment,
    name varchar(40)
    );
    
create table role (
	id int primary key auto_increment,
    title varchar(30),
    salary decimal(10, 2),
    department_id int
    );

create table employee (
	id int primary key auto_increment,
    first_name varchar(30),
    last_name varchar(40),
    role_id int,
    manager_id int
    );
    
    