from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
import random
import hashlib
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Session Configuration from environment variables
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'smartbus_default_secret_key')
app.config['SESSION_TYPE'] = os.getenv('SESSION_TYPE', 'filesystem')
app.config['SESSION_PERMANENT'] = os.getenv('SESSION_PERMANENT', 'True') == 'True'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=int(os.getenv('SESSION_LIFETIME_DAYS', '7')))
app.config['SESSION_COOKIE_HTTPONLY'] = os.getenv('SESSION_COOKIE_HTTPONLY', 'True') == 'True'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Lax works for same-origin (via proxy)
app.config['SESSION_COOKIE_SECURE'] = False  # False for development

# Enable CORS - proxy makes it same-origin but keep for direct access
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Custom CORS headers (mainly for direct backend access during development)
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    allowed_origins = ['http://localhost:5173', 'http://127.0.0.1:5173']
    
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    return response

# Initialize session
Session(app)

# Database connection using environment variables
def get_db():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'smartbus'),
        port=int(os.getenv('DB_PORT', '3306'))
    )

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to check if user is logged in
def is_logged_in():
    return 'user_id' in session and 'user_type' in session

@app.route('/')
def home():
    return {"message": "Smart Bus Tracking API Running", "version": "1.0"}

# User Registration
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type')  # 'student' or 'driver'
        
        if not all([username, email, password, user_type]):
            return jsonify({"success": False, "error": "All fields are required"}), 400
        
        if user_type not in ['student', 'driver']:
            return jsonify({"success": False, "error": "Invalid user type"}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if username or email already exists
        cursor.execute("SELECT USER_ID FROM USER_ACCOUNTS WHERE USERNAME=%s OR EMAIL=%s", (username, email))
        if cursor.fetchone():
            return jsonify({"success": False, "error": "Username or email already exists"}), 400
        
        # Hash password and insert user
        password_hash = hash_password(password)
        cursor.execute(
            "INSERT INTO USER_ACCOUNTS (USERNAME, EMAIL, PASSWORD_HASH, USER_TYPE) VALUES (%s, %s, %s, %s)",
            (username, email, password_hash, user_type)
        )
        user_id = cursor.lastrowid
        
        # If driver, create driver record
        if user_type == 'driver':
            license_number = data.get('license_number', '')
            experience_years = data.get('experience_years', 0)
            cursor.execute(
                "INSERT INTO DRIVER (USER_ID, LICENSE_NUMBER, EXPERIENCE_YEARS) VALUES (%s, %s, %s)",
                (user_id, license_number, experience_years)
            )
        
        db.commit()
        db.close()
        
        return jsonify({"success": True, "message": f"{user_type.title()} registered successfully!"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# User Login
@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"success": False, "error": "Username and password are required"}), 400
        
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Check credentials
        password_hash = hash_password(password)
        cursor.execute(
            "SELECT USER_ID, USERNAME, EMAIL, USER_TYPE FROM USER_ACCOUNTS WHERE USERNAME=%s AND PASSWORD_HASH=%s AND IS_ACTIVE=TRUE",
            (username, password_hash)
        )
        user = cursor.fetchone()
        
        if user:
            # Set session
            session['user_id'] = user['USER_ID']
            session['username'] = user['USERNAME']
            session['email'] = user['EMAIL']
            session['user_type'] = user['USER_TYPE']
            session.permanent = True  # IMPORTANT: Makes session persist
            
            # Get additional info based on user type
            user_info = {
                "user_id": user['USER_ID'],
                "username": user['USERNAME'],
                "email": user['EMAIL'],
                "user_type": user['USER_TYPE']
            }
            
            if user['USER_TYPE'] == 'driver':
                cursor.execute("SELECT * FROM DRIVER WHERE USER_ID=%s", (user['USER_ID'],))
                driver_info = cursor.fetchone()
                if driver_info:
                    user_info['driver_info'] = driver_info
            
            db.close()
            return jsonify({"success": True, "message": "Login successful!", "user": user_info})
        else:
            db.close()
            return jsonify({"success": False, "error": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# User Logout
@app.route('/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

# Check login status
@app.route('/auth/status', methods=['GET'])
def auth_status():
    if is_logged_in():
        return jsonify({
            "success": True,
            "logged_in": True,
            "user": {
                "user_id": session.get('user_id'),
                "username": session.get('username'),
                "email": session.get('email'),
                "user_type": session.get('user_type')
            }
        })
    else:
        return jsonify({"success": True, "logged_in": False})

# Get all routes
@app.route('/routes', methods=['GET'])
def get_routes():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ROUTE")
        routes = cursor.fetchall()
        db.close()
        return jsonify({"success": True, "data": routes})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Get stops by route
@app.route('/stops/<int:route_id>', methods=['GET'])
def get_stops(route_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM STOP WHERE R_ID=%s ORDER BY STOP_ID", (route_id,))
        stops = cursor.fetchall()
        db.close()
        return jsonify({"success": True, "data": stops})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Get all buses
@app.route('/buses', methods=['GET'])
def get_buses():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM BUS")
        buses = cursor.fetchall()
        db.close()
        return jsonify({"success": True, "data": buses})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Get buses by route ID
@app.route('/buses/route/<int:route_id>', methods=['GET'])
def get_buses_by_route(route_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Check if BUS table has R_ID column
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'BUS' 
            AND COLUMN_NAME = 'R_ID'
        """)
        has_r_id = cursor.fetchone() is not None
        
        if has_r_id:
            # Use R_ID directly
            cursor.execute("SELECT * FROM BUS WHERE R_ID = %s", (route_id,))
        else:
            # Fallback: return all buses (for now, until R_ID is added)
            cursor.execute("SELECT * FROM BUS")
        
        buses = cursor.fetchall()
        db.close()
        return jsonify({"success": True, "data": buses})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Register a student for bus service
@app.route('/student-register', methods=['POST'])
def register_student():
    try:
        data = request.json
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute(
            "INSERT INTO STUDENT (S_NAME, S_EMAIL, S_PHONE, R_ID, STOP_ID) VALUES (%s, %s, %s, %s, %s)",
            (data["name"], data["email"], data.get("phone", ""), data["route_id"], data["stop_id"])
        )
        db.commit()
        db.close()
        return jsonify({"success": True, "message": "Student registered successfully!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Get student details by email
@app.route('/student/details/<email>', methods=['GET'])
def get_student_details(email):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Check if REGISTRATION_DATE column exists in STUDENT table
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'STUDENT' 
            AND COLUMN_NAME = 'REGISTRATION_DATE'
        """)
        has_reg_date = cursor.fetchone() is not None
        
        # Check if STOP_ORDER column exists in STOP table
        cursor.execute("""
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'STOP' 
            AND COLUMN_NAME = 'STOP_ORDER'
        """)
        has_stop_order = cursor.fetchone() is not None
        
        # Build query based on available columns
        student_cols = "s.S_ID, s.S_NAME, s.S_EMAIL, s.S_PHONE"
        if has_reg_date:
            student_cols += ", s.REGISTRATION_DATE"
            
        stop_cols = "st.STOP_ID, st.STOP_NAME, st.LOCATION"
        if has_stop_order:
            stop_cols += ", st.STOP_ORDER"
        
        query = f"""
            SELECT 
                {student_cols},
                r.R_ID, r.R_NAME, r.START_POINT, r.END_POINT, r.DISTANCE,
                {stop_cols}
            FROM STUDENT s
            LEFT JOIN ROUTE r ON s.R_ID = r.R_ID
            LEFT JOIN STOP st ON s.STOP_ID = st.STOP_ID
            WHERE s.S_EMAIL = %s
        """
        
        cursor.execute(query, (email,))
        student = cursor.fetchone()
        db.close()
        
        if student:
            return jsonify({"success": True, "data": student})
        else:
            return jsonify({"success": False, "message": "Student not found or not registered for bus service"})
    except Exception as e:
        print(f"Error in get_student_details: {str(e)}")  # Log the error
        return jsonify({"success": False, "error": str(e)}), 500

# Get schedule by route
@app.route('/schedule/<int:route_id>', methods=['GET'])
def get_schedule(route_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                s.SCH_ID,
                s.B_ID,
                b.B_NO,
                b.D_NAME,
                TIME_FORMAT(s.D_TIME, '%H:%i:%s') AS D_TIME,
                TIME_FORMAT(s.A_TIME, '%H:%i:%s') AS A_TIME,
                s.DAY
            FROM SCHEDULE s
            JOIN BUS b ON s.B_ID = b.B_ID
            ORDER BY FIELD(s.DAY, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), s.D_TIME
        """)
        schedules = cursor.fetchall()
        db.close()
        return jsonify({"success": True, "data": schedules})
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": str(e)}), 500

# Get bus location (latest tracking data)
@app.route('/bus-location/<int:bus_id>', methods=['GET'])
def get_bus_location(bus_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT t.*, b.B_NO, b.D_NAME 
            FROM TRACKING t 
            JOIN BUS b ON t.B_ID = b.B_ID 
            WHERE t.B_ID=%s 
            ORDER BY t.TIMESTAMP DESC LIMIT 1
        """, (bus_id,))
        location = cursor.fetchone()
        db.close()
        
        if location:
            return jsonify({"success": True, "data": location})
        else:
            return jsonify({"success": False, "message": "No tracking data available"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Simulate GPS tracking updates
@app.route('/track/<int:bus_id>', methods=['POST'])
def track_bus(bus_id):
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Generate random coordinates around Delhi area
        lat = 28.60 + random.uniform(-0.01, 0.01)
        lon = 77.20 + random.uniform(-0.01, 0.01)
        
        cursor.execute(
            "INSERT INTO TRACKING (B_ID, TIMESTAMP, LATITUDE, LONGITUDE) VALUES (%s, %s, %s, %s)",
            (bus_id, datetime.now(), lat, lon)
        )
        db.commit()
        db.close()
        
        return jsonify({
            "success": True,
            "message": f"Bus {bus_id} location updated",
            "data": {"lat": lat, "lon": lon, "timestamp": datetime.now().isoformat()}
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Get all tracking history for a bus
@app.route('/tracking-history/<int:bus_id>', methods=['GET'])
def get_tracking_history(bus_id):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM TRACKING 
            WHERE B_ID=%s 
            ORDER BY TIMESTAMP DESC 
            LIMIT 10
        """, (bus_id,))
        history = cursor.fetchall()
        db.close()
        return jsonify({"success": True, "data": history})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Update bus location (for drivers with GPS)
@app.route('/update-location', methods=['POST'])
def update_location():
    try:
        # Debug: Check session
        print(f"Session data: {dict(session)}")
        print(f"Is logged in: {is_logged_in()}")
        
        # Check if user is logged in
        if not is_logged_in():
            print("Authentication failed - no session")
            return jsonify({"success": False, "error": "Authentication required"}), 401
        
        # Check if user is a driver
        if session.get('user_type') != 'driver':
            return jsonify({"success": False, "error": "Driver access required"}), 403
        
        data = request.json
        bus_id = data.get('bus_id')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        accuracy = data.get('accuracy')
        timestamp_str = data.get('timestamp')
        
        if not all([bus_id, latitude, longitude]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Insert location update
        cursor.execute(
            "INSERT INTO TRACKING (B_ID, TIMESTAMP, LATITUDE, LONGITUDE) VALUES (%s, %s, %s, %s)",
            (bus_id, datetime.now(), latitude, longitude)
        )
        db.commit()
        db.close()
        
        return jsonify({
            "success": True,
            "message": "Location updated successfully"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Get all bus locations (for students map)
@app.route('/all-bus-locations', methods=['GET'])
def get_all_bus_locations():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        # Get latest location for each bus
        cursor.execute("""
            SELECT 
                b.B_ID,
                b.B_NO,
                b.D_NAME,
                t.LATITUDE,
                t.LONGITUDE,
                t.TIMESTAMP
            FROM BUS b
            LEFT JOIN (
                SELECT B_ID, LATITUDE, LONGITUDE, TIMESTAMP
                FROM TRACKING t1
                WHERE TIMESTAMP = (
                    SELECT MAX(TIMESTAMP)
                    FROM TRACKING t2
                    WHERE t2.B_ID = t1.B_ID
                )
            ) t ON b.B_ID = t.B_ID
            WHERE t.LATITUDE IS NOT NULL
        """)
        
        locations = cursor.fetchall()
        db.close()
        
        return jsonify({"success": True, "data": locations})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== NOTIFICATION ENDPOINTS ====================

# Get notifications for a student
@app.route('/notifications/<int:student_id>', methods=['GET'])
def get_notifications(student_id):
    """Get all notifications for a student"""
    try:
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 20))
        
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        query = """
            SELECT 
                N.N_ID,
                N.MESSAGE,
                N.TYPE,
                N.IS_READ,
                N.CREATED_AT,
                B.B_NO,
                B.D_NAME as DRIVER_NAME
            FROM NOTIFICATION N
            JOIN BUS B ON N.B_ID = B.B_ID
            WHERE N.S_ID = %s
        """
        
        if unread_only:
            query += " AND N.IS_READ = FALSE"
        
        query += " ORDER BY N.CREATED_AT DESC LIMIT %s"
        
        cursor.execute(query, (student_id, limit))
        notifications = cursor.fetchall()
        
        # Get unread count
        cursor.execute("""
            SELECT COUNT(*) as unread_count
            FROM NOTIFICATION
            WHERE S_ID = %s AND IS_READ = FALSE
        """, (student_id,))
        
        unread_count = cursor.fetchone()['unread_count']
        
        db.close()
        
        return jsonify({
            "success": True, 
            "data": notifications,
            "unread_count": unread_count
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Mark notification as read
@app.route('/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    """Mark a specific notification as read"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("UPDATE NOTIFICATION SET IS_READ = TRUE WHERE N_ID = %s", (notification_id,))
        db.commit()
        db.close()
        
        return jsonify({"success": True, "message": "Notification marked as read"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Mark all notifications as read for a student
@app.route('/notifications/student/<int:student_id>/read-all', methods=['PUT'])
def mark_all_notifications_read(student_id):
    """Mark all notifications as read for a student"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("UPDATE NOTIFICATION SET IS_READ = TRUE WHERE S_ID = %s", (student_id,))
        db.commit()
        db.close()
        
        return jsonify({"success": True, "message": "All notifications marked as read"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Delete a notification
@app.route('/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a specific notification"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("DELETE FROM NOTIFICATION WHERE N_ID = %s", (notification_id,))
        db.commit()
        db.close()
        
        return jsonify({"success": True, "message": "Notification deleted"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Create manual notification (for admin/testing)
@app.route('/notifications/create', methods=['POST'])
def create_notification():
    """Create a new notification"""
    try:
        data = request.json
        
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            INSERT INTO NOTIFICATION (S_ID, B_ID, MESSAGE, TYPE, IS_READ)
            VALUES (%s, %s, %s, %s, FALSE)
        """, (
            data['student_id'],
            data['bus_id'],
            data['message'],
            data.get('type', 'general')
        ))
        
        db.commit()
        notification_id = cursor.lastrowid
        db.close()
        
        return jsonify({
            "success": True,
            "message": "Notification created",
            "notification_id": notification_id
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    # Get configuration from environment variables
    debug_mode = os.getenv('FLASK_DEBUG', 'True') == 'True'
    host = os.getenv('API_HOST', '0.0.0.0')
    port = int(os.getenv('API_PORT', '5000'))
    
    app.run(debug=debug_mode, host=host, port=port)
