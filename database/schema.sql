CREATE DATABASE smartbus;
USE smartbus;

-- Bus details
CREATE TABLE BUS (
    B_ID INT PRIMARY KEY AUTO_INCREMENT,
    B_NO VARCHAR(10) NOT NULL,
    D_NAME VARCHAR(50),
    D_PHONE VARCHAR(15),
    CAPACITY INT NOT NULL
);

-- Route details
CREATE TABLE ROUTE (
    R_ID INT PRIMARY KEY AUTO_INCREMENT,
    R_NAME VARCHAR(50) NOT NULL,
    START_POINT VARCHAR(50),
    END_POINT VARCHAR(50)
);

-- Stops for each route
CREATE TABLE STOP (
    STOP_ID INT PRIMARY KEY AUTO_INCREMENT,
    STOP_NAME VARCHAR(50) NOT NULL,
    LOCATION VARCHAR(100),
    R_ID INT,
    FOREIGN KEY (R_ID) REFERENCES ROUTE(R_ID)
);

-- Student details
CREATE TABLE STUDENT (
    S_ID INT PRIMARY KEY AUTO_INCREMENT,
    S_NAME VARCHAR(50) NOT NULL,
    S_EMAIL VARCHAR(100) UNIQUE NOT NULL,
    S_PHONE VARCHAR(15),
    STOP_ID INT,
    R_ID INT,
    FOREIGN KEY (STOP_ID) REFERENCES STOP(STOP_ID),
    FOREIGN KEY (R_ID) REFERENCES ROUTE(R_ID)
);

-- Daily schedule
CREATE TABLE SCHEDULE (
    SCH_ID INT PRIMARY KEY AUTO_INCREMENT,
    B_ID INT NOT NULL,
    A_TIME TIME,
    D_TIME TIME,
    DAY VARCHAR(10),
    FOREIGN KEY (B_ID) REFERENCES BUS(B_ID)
);

-- Bus live location tracking
CREATE TABLE TRACKING (
    T_ID INT PRIMARY KEY AUTO_INCREMENT,
    B_ID INT NOT NULL,
    TIMESTAMP DATETIME DEFAULT CURRENT_TIMESTAMP,
    LATITUDE DECIMAL(10,8) NOT NULL,
    LONGITUDE DECIMAL(11,8) NOT NULL,
    FOREIGN KEY (B_ID) REFERENCES BUS(B_ID)
);

-- User authentication
CREATE TABLE USER_ACCOUNTS (
    USER_ID INT PRIMARY KEY AUTO_INCREMENT,
    USERNAME VARCHAR(50) UNIQUE NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PASSWORD_HASH VARCHAR(255) NOT NULL,
    USER_TYPE ENUM('student', 'driver') NOT NULL,
    IS_ACTIVE BOOLEAN DEFAULT TRUE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver details
CREATE TABLE DRIVER (
    DRIVER_ID INT PRIMARY KEY AUTO_INCREMENT,
    USER_ID INT NOT NULL,
    B_ID INT,
    LICENSE_NUMBER VARCHAR(20),
    EXPERIENCE_YEARS INT,
    FOREIGN KEY (USER_ID) REFERENCES USER_ACCOUNTS(USER_ID),
    FOREIGN KEY (B_ID) REFERENCES BUS(B_ID)
);

-- Insert sample data
INSERT INTO BUS (B_NO, D_NAME, D_PHONE, CAPACITY) VALUES
('BUS001', 'Rajesh Kumar', '9876543210', 50),
('BUS002', 'Suresh Singh', '9876543211', 45),
('BUS003', 'Anita Sharma', '9876543212', 40),
('BUS004', 'Vikram Chauhan', '9876543213', 55),
('BUS005', 'Meena Joshi', '9876543214', 48),
('BUS006', 'Ravi Rawat', '9876543215', 52),
('BUS007', 'Kiran Negi', '9876543216', 44),
('BUS008', 'Deepak Mehra', '9876543217', 50),
('BUS009', 'Sunita Thakur', '9876543218', 46),
('BUS010', 'Amit Nautiyal', '9876543219', 49);

-- Insert sample users (password is 'password123' hashed)
INSERT INTO USER_ACCOUNTS (USERNAME, EMAIL, PASSWORD_HASH, USER_TYPE) VALUES 
('student1', 'student1@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'student'),
('driver1', 'rajesh@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'driver'),
('driver2', 'suresh@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'driver');

INSERT INTO ROUTE (R_NAME, START_POINT, END_POINT) VALUES
('Route 1', 'Doiwala', 'Gehu Bus Stand'),
('Route 2', 'Badowala', 'Gehu Bus Stand'),
('Route 3', 'Bhaniawala', 'Gehu Bus Stand'),
('Route 4', 'Rishikesh Road', 'Gehu Bus Stand'),
('Route 5', 'Bhagwanpur', 'Gehu Bus Stand'),
('Route 6', 'Kuanwala', 'Gehu Bus Stand'),
('Route 7', 'Harrawala', 'Gehu Bus Stand'),
('Route 8', 'Majra', 'Gehu Bus Stand'),
('Route 9', 'Shimla Bypass', 'Gehu Bus Stand'),
('Route 10', 'ISBT', 'Gehu Bus Stand');

-- Route 1: Doiwala to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Doiwala', 'Doiwala Chowk', 1),
('Thano', 'Thano Road Junction', 1),
('Bhogpur', 'Bhogpur Market', 1),
('Subhash Nagar', 'Subhash Nagar Crossing', 1),
('Gehu Bus Stand', 'Main Campus Terminal', 1);

-- Route 2: Badowala to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Badowala', 'Badowala Gate', 2),
('Mehuwala', 'Mehuwala Market', 2),
('Shimla Bypass', 'Shimla Bypass Junction', 2),
('Subhash Nagar', 'Subhash Nagar Crossing', 2),
('Gehu Bus Stand', 'Main Campus Terminal', 2);

-- Route 3: Bhaniawala to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Bhaniawala', 'Bhaniawala Junction', 3),
('Shiv Mandir', 'Opposite Shiv Mandir', 3),
('Rishikesh Road', 'Near AIIMS Gate', 3),
('Subhash Nagar', 'Subhash Nagar Crossing', 3),
('Gehu Bus Stand', 'Main Campus Terminal', 3);

-- Route 4: Rishikesh Road to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Rishikesh Road', 'Rishikesh Road Start', 4),
('Shyampur', 'Shyampur Crossing', 4),
('AIIMS', 'AIIMS Entrance', 4),
('Subhash Nagar', 'Subhash Nagar Crossing', 4),
('Gehu Bus Stand', 'Main Campus Terminal', 4);

-- Route 5: Bhagwanpur to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Bhagwanpur', 'Bhagwanpur Chowk', 5),
('SIDCUL', 'SIDCUL Gate', 5),
('Transport Nagar', 'Transport Office Area', 5),
('Subhash Nagar', 'Subhash Nagar Crossing', 5),
('Gehu Bus Stand', 'Main Campus Terminal', 5);

-- Route 6: Kuanwala to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Kuanwala', 'Kuanwala Junction', 6),
('Haridwar Bypass', 'Bypass Crossing', 6),
('Old ITI', 'Old ITI Campus', 6),
('Subhash Nagar', 'Subhash Nagar Crossing', 6),
('Gehu Bus Stand', 'Main Campus Terminal', 6);

-- Route 7: Harrawala to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Harrawala', 'Harrawala Railway Crossing', 7),
('Old ITI', 'Old ITI Campus', 7),
('Majra', 'Majra Chowk', 7),
('Subhash Nagar', 'Subhash Nagar Crossing', 7),
('Gehu Bus Stand', 'Main Campus Terminal', 7);

-- Route 8: Majra to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Majra', 'Majra Market Area', 8),
('Canal Road', 'Majra Canal Bridge', 8),
('Shimla Bypass', 'Shimla Bypass Junction', 8),
('Subhash Nagar', 'Subhash Nagar Crossing', 8),
('Gehu Bus Stand', 'Main Campus Terminal', 8);

-- Route 9: Shimla Bypass to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('Shimla Bypass', 'Shimla Bypass Start', 9),
('Kargi Chowk', 'Kargi Market', 9),
('Canal Road', 'Canal Road Crossing', 9),
('Subhash Nagar', 'Subhash Nagar Crossing', 9),
('Gehu Bus Stand', 'Main Campus Terminal', 9);

-- Route 10: ISBT to Gehu Bus Stand
INSERT INTO STOP (STOP_NAME, LOCATION, R_ID) VALUES
('ISBT', 'ISBT Entrance', 10),
('Transport Nagar', 'Transport Office Area', 10),
('Kargi Chowk', 'Kargi Market', 10),
('Subhash Nagar', 'Subhash Nagar Crossing', 10),
('Gehu Bus Stand', 'Main Campus Terminal', 10);

INSERT INTO SCHEDULE (B_ID, A_TIME, D_TIME, DAY) VALUES
(1, '07:30:00', '08:00:00', 'Monday'),
(1, '07:30:00', '08:00:00', 'Tuesday'),
(2, '08:15:00', '08:45:00', 'Wednesday'),
(2, '08:15:00', '08:45:00', 'Thursday'),
(3, '07:00:00', '07:30:00', 'Friday'),
(4, '08:00:00', '08:30:00', 'Monday'),
(5, '09:00:00', '09:30:00', 'Tuesday'),
(6, '07:45:00', '08:15:00', 'Wednesday'),
(7, '08:30:00', '09:00:00', 'Thursday'),
(8, '09:15:00', '09:45:00', 'Friday');

INSERT INTO STUDENT (S_NAME, S_EMAIL, S_PHONE, STOP_ID, R_ID) VALUES
('Priya Mehta', 'priya@acc.edu.in', '9000000001', 1, 1),
('Aman Verma', 'aman@acc.edu.in', '9000000002', 2, 1),
('Neha Rawat', 'neha@acc.edu.in', '9000000003', 3, 1),
('Rohit Negi', 'rohit@acc.edu.in', '9000000004', 4, 2),
('Simran Kaur', 'simran@acc.edu.in', '9000000005', 5, 2),
('Kunal Joshi', 'kunal@acc.edu.in', '9000000006', 6, 2),
('Divya Sharma', 'divya@acc.edu.in', '9000000007', 7, 3),
('Nikhil Rana', 'nikhil@acc.edu.in', '9000000008', 8, 3),
('Megha Thapa', 'megha@acc.edu.in', '9000000009', 9, 4),
('Yash Singh', 'yash@acc.edu.in', '9000000010', 10, 4);

INSERT INTO TRACKING (B_ID, LATITUDE, LONGITUDE) VALUES
(1, 30.28490000, 78.04800000),
(2, 30.28510000, 78.04900000),
(3, 30.28530000, 78.05000000),
(4, 30.28550000, 78.05100000),
(5, 30.28570000, 78.05200000),
(6, 30.28590000, 78.05300000),
(7, 30.28610000, 78.05400000),
(8, 30.28630000, 78.05500000),
(9, 30.28650000, 78.05600000),
(10, 30.28670000, 78.05700000);

INSERT INTO USER_ACCOUNTS (USERNAME, EMAIL, PASSWORD_HASH, USER_TYPE) VALUES
('student1', 'student1@acc.edu.in', 'ef92b7...', 'student'),
('student2', 'student2@acc.edu.in', 'ef92b7...', 'student'),
('student3', 'student3@acc.edu.in', 'ef92b7...', 'student'),
('student4', 'student4@acc.edu.in', 'ef92b7...', 'student'),
('student5', 'student5@acc.edu.in', 'ef92b7...', 'student'),
('driver1', 'rajesh@acc.edu.in', 'ef92b7...', 'driver'),
('driver2', 'suresh@acc.edu.in', 'ef92b7...', 'driver'),
('driver3', 'anita@acc.edu.in', 'ef92b7...', 'driver'),
('driver4', 'vikram@acc.edu.in', 'ef92b7...', 'driver'),
('driver5', 'meena@acc.edu.in', 'ef92b7...', 'driver');