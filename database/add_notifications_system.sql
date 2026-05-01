-- Notification System Migration
-- Adds complete notification functionality to the Smart Bus Tracking System

USE smartbus;

-- 1. Add stop order/sequence to STOP table
-- This is critical for knowing which stops come before others
ALTER TABLE STOP ADD COLUMN IF NOT EXISTS STOP_ORDER INT DEFAULT 1 AFTER STOP_NAME;

-- 2. Create NOTIFICATION table
CREATE TABLE IF NOT EXISTS NOTIFICATION (
    N_ID INT PRIMARY KEY AUTO_INCREMENT,
    S_ID INT NOT NULL,
    B_ID INT NOT NULL,
    MESSAGE TEXT NOT NULL,
    TYPE ENUM('pickup', 'dropoff', 'delay', 'general') DEFAULT 'general',
    IS_READ BOOLEAN DEFAULT FALSE,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (S_ID) REFERENCES STUDENT(S_ID) ON DELETE CASCADE,
    FOREIGN KEY (B_ID) REFERENCES BUS(B_ID) ON DELETE CASCADE,
    INDEX idx_student (S_ID),
    INDEX idx_read (IS_READ),
    INDEX idx_created (CREATED_AT)
);

-- 3. Add notification preferences to STUDENT table
ALTER TABLE STUDENT ADD COLUMN IF NOT EXISTS NOTIFY_EMAIL BOOLEAN DEFAULT TRUE;
ALTER TABLE STUDENT ADD COLUMN IF NOT EXISTS NOTIFY_SMS BOOLEAN DEFAULT FALSE;
ALTER TABLE STUDENT ADD COLUMN IF NOT EXISTS NOTIFY_PUSH BOOLEAN DEFAULT TRUE;

-- 4. Add current stop tracking to TRACKING table
ALTER TABLE TRACKING ADD COLUMN IF NOT EXISTS CURRENT_STOP_ID INT DEFAULT NULL AFTER LONGITUDE;
ALTER TABLE TRACKING ADD INDEX IF NOT EXISTS idx_current_stop (CURRENT_STOP_ID);

-- Try to add foreign key if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'TRACKING' 
    AND CONSTRAINT_NAME = 'tracking_stop_fk');

SET @add_fk = IF(@fk_exists = 0,
    'ALTER TABLE TRACKING ADD CONSTRAINT tracking_stop_fk FOREIGN KEY (CURRENT_STOP_ID) REFERENCES STOP(STOP_ID) ON DELETE SET NULL',
    'SELECT "Foreign key already exists"'
);

PREPARE stmt FROM @add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Add route ID to SCHEDULE table for better route-schedule integration
ALTER TABLE SCHEDULE ADD COLUMN IF NOT EXISTS R_ID INT DEFAULT NULL AFTER B_ID;
ALTER TABLE SCHEDULE ADD INDEX IF NOT EXISTS idx_route (R_ID);

-- Try to add foreign key for schedule route
SET @fk_exists = (SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'SCHEDULE' 
    AND CONSTRAINT_NAME = 'schedule_route_fk');

SET @add_fk = IF(@fk_exists = 0,
    'ALTER TABLE SCHEDULE ADD CONSTRAINT schedule_route_fk FOREIGN KEY (R_ID) REFERENCES ROUTE(R_ID) ON DELETE CASCADE',
    'SELECT "Foreign key already exists"'
);

PREPARE stmt FROM @add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Update existing stops with sequential order (per route)
-- This assumes stops are already in the correct order in the database
SET @order_num := 0;
SET @current_route := 0;

UPDATE STOP 
SET STOP_ORDER = (
    SELECT @order_num := IF(R_ID = @current_route, @order_num + 1, 1) * 0 + 
           (@current_route := R_ID) * 0 + 
           (@order_num := @order_num + 1)
    FROM (SELECT @order_num := 0, @current_route := 0) init
)
ORDER BY R_ID, STOP_ID;

-- 7. Add admin user type
ALTER TABLE USER_ACCOUNTS MODIFY COLUMN USER_TYPE ENUM('student', 'driver', 'admin') NOT NULL;

-- 8. Insert a default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using SHA256
INSERT IGNORE INTO USER_ACCOUNTS (USERNAME, EMAIL, PASSWORD_HASH, USER_TYPE) 
VALUES ('admin', 'admin@smartbus.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin');

-- 9. Create a view for easy notification queries
CREATE OR REPLACE VIEW student_notifications AS
SELECT 
    N.N_ID,
    N.MESSAGE,
    N.TYPE,
    N.IS_READ,
    N.CREATED_AT,
    S.S_NAME,
    S.S_EMAIL,
    B.B_NO,
    B.D_NAME as DRIVER_NAME
FROM NOTIFICATION N
JOIN STUDENT S ON N.S_ID = S.S_ID
JOIN BUS B ON N.B_ID = B.B_ID
ORDER BY N.CREATED_AT DESC;

-- 10. Create a view for student dashboard
CREATE OR REPLACE VIEW student_dashboard AS
SELECT 
    S.S_ID,
    S.S_NAME,
    S.S_EMAIL,
    S.S_PHONE,
    R.R_NAME,
    R.START_POINT,
    R.END_POINT,
    ST.STOP_NAME,
    ST.STOP_ORDER,
    ST.LOCATION,
    B.B_NO,
    B.D_NAME as DRIVER_NAME,
    B.D_PHONE as DRIVER_PHONE
FROM STUDENT S
LEFT JOIN ROUTE R ON S.R_ID = R.R_ID
LEFT JOIN STOP ST ON S.STOP_ID = ST.STOP_ID
LEFT JOIN BUS B ON B.R_ID = R.R_ID;

-- Display summary
SELECT 'Notification System Migration Complete!' as Status;

SELECT 
    (SELECT COUNT(*) FROM NOTIFICATION) as Total_Notifications,
    (SELECT COUNT(*) FROM STOP WHERE STOP_ORDER IS NOT NULL) as Stops_With_Order,
    (SELECT COUNT(*) FROM STUDENT WHERE NOTIFY_EMAIL = TRUE) as Students_Email_Enabled,
    (SELECT COUNT(*) FROM USER_ACCOUNTS WHERE USER_TYPE = 'admin') as Admin_Users;

