# 🚌 Smart Bus Tracker - Database

This folder contains all database-related files for the Smart Bus Tracking System.

## 📁 Files

- **`schema.sql`** - Complete database schema with sample data
- **`README.md`** - This file

## 🗄️ Database Schema

### Core Tables

#### User Management
- **`USER_ACCOUNTS`** - User authentication (students & drivers)
- **`DRIVER`** - Driver-specific information

#### Bus System
- **`BUS`** - Bus details and capacity
- **`ROUTE`** - Route information
- **`STOP`** - Bus stops for each route
- **`STUDENT`** - Student bus service registration
- **`SCHEDULE`** - Bus schedules and timings
- **`TRACKING`** - Real-time GPS coordinates

## 🚀 Setup

### 1. Start MySQL Server
Ensure MySQL is running on your system.

### 2. Create Database
Run the schema file:
```bash
mysql -u root -p < schema.sql
```

Or in MySQL command line:
```sql
source schema.sql;
```

### 3. Verify Setup
Check that all tables are created:
```sql
USE smartbus;
SHOW TABLES;
```

## 👤 Sample Data

The schema includes test accounts:

### Students
- **Username**: `student1`
- **Email**: `student1@example.com`
- **Password**: `password123` (hashed)

### Drivers
- **Username**: `driver1`
- **Email**: `rajesh@example.com`
- **Password**: `password123` (hashed)

- **Username**: `driver2`
- **Email**: `suresh@example.com`
- **Password**: `password123` (hashed)

### Sample Data
- **2 Buses**: BUS001, BUS002
- **2 Routes**: Route A, Route B
- **6 Stops**: Across both routes
- **10 Schedule Entries**: Monday-Friday schedules

## 🔧 Database Configuration

Update the connection settings in `backend/app.py`:

```python
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",                    # Your MySQL username
        password="yourpassword",        # Your MySQL password
        database="smartbus"
    )
```

## 🔒 Security

- **Password Hashing**: SHA-256 encryption
- **User Types**: Student and driver separation
- **Foreign Keys**: Proper table relationships
- **Data Validation**: Required fields and constraints

## 📊 Table Relationships

```
USER_ACCOUNTS (1:1) DRIVER
USER_ACCOUNTS (1:N) STUDENT
ROUTE (1:N) STOP
BUS (1:N) SCHEDULE
BUS (1:N) TRACKING
```

## 🧪 Testing

Use the sample accounts to test:
1. Student login and bus tracking
2. Driver login and location updates
3. Route and schedule viewing
4. GPS tracking simulation
